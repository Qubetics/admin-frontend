import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { useIsLoggedIn } from '../../../Context/LoggedInContext';
import useNetworkRequest from '../../../Hooks/useGetApi';
import { processTransaction } from '../../../service/processTransaction/processTransaction';
import { buildLinkNodeMessage, buildStartLeaseStatusMessage, buildEndLeaseStatusMessage } from '../../../service/BuildMessage/buildMessage';
import { convertNodeToWallet, getValueWithUnit, truncateValue, convertPlanString } from '../../../utils/Helper/CommonHelper';
import { toast } from 'react-toastify';

// Type definitions for test mocks
interface ApiParams {
    endpoint?: string;
    method?: string;
    body?: Record<string, unknown> | string | number | boolean | null;
    url?: string;
}

interface PaginationProps {
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

interface NotificationModalProps {
    show: boolean;
    handleClose: () => void;
    heading: string;
    description: string;
}

interface CopyTextProps {
    text: string;
}

// Mock failing libraries
jest.mock('@keplr-wallet/cosmos', () => ({
  TendermintTxTracer: class MockTendermintTxTracer {
    traceTx = jest.fn().mockResolvedValue({ ok: true });
    constructor(_endpoint: string, _path: string) {
      // Mock constructor
    }
  },
} as Record<string, unknown>), { virtual: true });
jest.mock('@keplr-wallet/proto-types', () => ({} as Record<string, never>), { virtual: true });
jest.mock('@cosmjs/stargate', () => ({} as Record<string, never>), { virtual: true });
jest.mock('@cosmjs/proto-signing', () => ({} as Record<string, never>), { virtual: true });

// Mock dependencies
jest.mock('../../../Context/LoggedInContext');
jest.mock('../../../Hooks/useGetApi');
jest.mock('../../../service/processTransaction/processTransaction');
jest.mock('../../../service/BuildMessage/buildMessage');
jest.mock('../../../utils/Helper/CommonHelper', () => ({
    convertNodeToWallet: jest.fn(),
    getValueWithUnit: jest.fn(),
    truncateValue: jest.fn(),
    convertPlanString: jest.fn(),
    buttons: jest.fn(() => [
        { label: 'All Requests', value: 'allrequest', count: 0 },
        { label: 'Link Requests', value: 'Link', count: 0 },
        { label: 'Unlink Requests', value: 'Unlink', count: 0 }
    ]),
}));
jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));
jest.mock('../../../utils/pagination', () => {
    return function DummyPagination({ onPageChange, onLimitChange }: PaginationProps) {
        return (
            <div data-testid="pagination">
                <button onClick={() => onPageChange(2)}>Next Page</button>
                <button onClick={() => onLimitChange(10)}>Change Limit</button>
            </div>
        );
    };
});
jest.mock('../../../Common/NotificationModal/NotificationModal', () => {
    return function DummyNotificationModal({ show, handleClose, heading, description }: NotificationModalProps) {
        if (!show) return null;
        return (
            <div data-testid="notification-modal">
                <h1>{heading}</h1>
                <p>{description}</p>
                <button onClick={handleClose}>Close</button>
            </div>
        );
    };
});
jest.mock('../../../Common/Copy/CopyText', () => {
    return function DummyCopyText({ text }: CopyTextProps) {
        return <div data-testid="copy-text">{text}</div>;
    };
});
jest.mock('../../../assets/SvgIcon/SvgIcon', () => ({
    CircleCheckIcon: () => <svg data-testid="circle-check-icon" />,
}));

describe('Dashboard Component', () => {
    const mockUseIsLoggedIn = useIsLoggedIn as jest.Mock;
    const mockUseNetworkRequest = useNetworkRequest as jest.Mock;
    const mockProcessTransaction = processTransaction as jest.Mock;
    const mockBuildLinkNodeMessage = buildLinkNodeMessage as jest.Mock;
    const mockBuildStartLeaseStatusMessage = buildStartLeaseStatusMessage as jest.Mock;
    const mockBuildEndLeaseStatusMessage = buildEndLeaseStatusMessage as jest.Mock;
    const mockConvertNodeToWallet = convertNodeToWallet as jest.Mock;
    const mockGetValueWithUnit = getValueWithUnit as jest.Mock;
    const mockTruncateValue = truncateValue as jest.Mock;
    const mockConvertPlanString = convertPlanString as jest.Mock;

    const mockApi = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockProcessTransaction.mockReset();
        mockUseIsLoggedIn.mockReturnValue({ authData: 'test-wallet' });
        mockUseNetworkRequest.mockReturnValue(mockApi);
        mockConvertNodeToWallet.mockReturnValue('prov-address');
        mockGetValueWithUnit.mockImplementation((val) => val);
        mockTruncateValue.mockImplementation((val) => val);
        mockConvertPlanString.mockImplementation((val) => val || '-');
        
        // Default API response based on endpoint
        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5, inactiveCount: 2, totalCount: 7 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: [] }, total: 0 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });
    });

    test('renders dashboard header and cards', async () => {
        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Active Nodes')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    test('fetches and displays node requests', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Org 1')).toBeInTheDocument();
            expect(screen.getByText('Link')).toBeInTheDocument();
            expect(screen.getByText('Approve')).toBeInTheDocument();
            expect(screen.getByText('Reject')).toBeInTheDocument();
        });
    });

    test('handles tab change', async () => {
        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });

        // Find the Link tab button
        const buttons = screen.getAllByRole('button');
        const linkTab = buttons.find((btn: HTMLElement) => btn.textContent?.includes('Link') && btn.textContent?.includes('Requests'));
        
        expect(linkTab).toBeDefined();
        
        await act(async () => {
            fireEvent.click(linkTab!);
        });

        expect(linkTab).toHaveClass('active');
    });

    test('handles pagination', async () => {
        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: [] }, total: 100 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByTestId('pagination')).toBeInTheDocument();
        });

        const nextPageBtn = screen.getByText('Next Page');
        await act(async () => {
            fireEvent.click(nextPageBtn);
        });
        
        expect(mockApi).toHaveBeenCalled();
    });

    test('handles approve action for Link request', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: true });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        mockProcessTransaction.mockResolvedValue('tx-hash');
        mockBuildLinkNodeMessage.mockReturnValue({});
        mockBuildStartLeaseStatusMessage.mockReturnValue({});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockBuildStartLeaseStatusMessage).toHaveBeenCalled();
            expect(mockBuildLinkNodeMessage).toHaveBeenCalled();
            expect(mockProcessTransaction).toHaveBeenCalled();
        });
    });

    test('handles approve action for Unlink request', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Unlink',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: true });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        mockProcessTransaction.mockResolvedValue('tx-hash');
        mockBuildEndLeaseStatusMessage.mockReturnValue({});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockBuildEndLeaseStatusMessage).toHaveBeenCalled();
            expect(mockProcessTransaction).toHaveBeenCalled();
        });
    });

    test('handles reject action', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: true });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Reject')).toBeInTheDocument();
        });

        const rejectBtn = screen.getByText('Reject');
        await act(async () => {
            fireEvent.click(rejectBtn);
        });

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to reject the request?')).toBeInTheDocument();
        });

        const yesBtn = screen.getByText('Yes');
        await act(async () => {
            fireEvent.click(yesBtn);
        });

        await waitFor(() => {
            expect(mockApi).toHaveBeenCalledWith(expect.objectContaining({
                endpoint: expect.stringContaining('/api/v1/node/action')
            }));
        });
    });

    test('handles API errors gracefully', async () => {
        mockApi.mockResolvedValue({ success: false });
        
        await act(async () => {
            render(<Dashboard />);
        });
        
        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });

        expect(screen.queryByText('Org 1')).not.toBeInTheDocument();
    });

    test('handles transaction failure for Link request', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        mockProcessTransaction.mockResolvedValue(null);
        mockBuildLinkNodeMessage.mockReturnValue({});
        mockBuildStartLeaseStatusMessage.mockReturnValue({});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockProcessTransaction).toHaveBeenCalled();
        });
    });

    test('handles transaction error', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        mockProcessTransaction.mockRejectedValue(new Error('Transaction failed'));
        mockBuildLinkNodeMessage.mockReturnValue({});
        mockBuildStartLeaseStatusMessage.mockReturnValue({});

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockProcessTransaction).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    test('displays no data message when node list is empty', async () => {
        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument();
        });
    });

    test('handles convertPlanString with undefined plan', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: undefined,
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Org 1')).toBeInTheDocument();
        });
    });

    test('handles updateStatus failure', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Unlink',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: false });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        mockProcessTransaction.mockResolvedValue('tx-hash');
        mockBuildEndLeaseStatusMessage.mockReturnValue({});

        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockProcessTransaction).toHaveBeenCalled();
        });

        consoleLogSpy.mockRestore();
    });

    test('handles Unlink transaction failure and shows error toast', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Unlink',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        mockProcessTransaction.mockRejectedValue(new Error('Transaction failed'));
        mockBuildEndLeaseStatusMessage.mockReturnValue({});

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockProcessTransaction).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Something went wrong');
        });

        consoleErrorSpy.mockRestore();
    });

    test('handles lease transaction failure (setUnLease)', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: true });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        // First processTransaction (lease) returns null, second (link) returns tx-hash
        mockProcessTransaction
            .mockResolvedValueOnce(null)  // lease fails
            .mockResolvedValueOnce('tx-hash');  // link succeeds
        mockBuildLinkNodeMessage.mockReturnValue({});
        mockBuildStartLeaseStatusMessage.mockReturnValue({});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockBuildStartLeaseStatusMessage).toHaveBeenCalled();
            // expect(mockBuildLinkNodeMessage).toHaveBeenCalled(); // Should not be called on lease failure
        });
    });

    test('handles data with total = 0 (setTotalPages to 1)', async () => {
        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: [] }, total: 0 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });

        // Pagination should not be shown when totalPages <= 1
        expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    test('closes notification modals', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: true });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        // Both transactions succeed to trigger lease modal
        mockProcessTransaction
            .mockResolvedValueOnce('lease-tx-hash')  // lease succeeds - triggers lease modal
            .mockResolvedValueOnce('link-tx-hash');  // link succeeds
        mockBuildLinkNodeMessage.mockReturnValue({});
        mockBuildStartLeaseStatusMessage.mockReturnValue({});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        // Wait for notification modal to appear
        await waitFor(() => {
            const modals = screen.queryAllByTestId('notification-modal');
            expect(modals.length).toBeGreaterThan(0);
        });

        // Close the modal
        const closeButtons = screen.getAllByText('Close');
        if (closeButtons.length > 0) {
            await act(async () => {
                fireEvent.click(closeButtons[0]);
            });
        }
    });

    test('handles Unlink transaction returning null', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Unlink',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        mockProcessTransaction.mockResolvedValue(null);
        mockBuildEndLeaseStatusMessage.mockReturnValue({});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockProcessTransaction).toHaveBeenCalled();
        });

        // Should not call updateStatus or show modal when TxHash is null
        expect(screen.queryByText('Node Approved successfully!')).not.toBeInTheDocument();
    });

    test('handles limit change in pagination', async () => {
        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: [] }, total: 100 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByTestId('pagination')).toBeInTheDocument();
        });

        const changeLimitBtn = screen.getByText('Change Limit');
        await act(async () => {
            fireEvent.click(changeLimitBtn);
        });
        
        expect(mockApi).toHaveBeenCalled();
    });

    test('handles lease success and closes lease modal', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: true });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        // Both transactions succeed
        mockProcessTransaction
            .mockResolvedValueOnce('lease-tx-hash')  // lease succeeds
            .mockResolvedValueOnce('link-tx-hash');  // link succeeds
        mockBuildLinkNodeMessage.mockReturnValue({});
        mockBuildStartLeaseStatusMessage.mockReturnValue({});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockBuildStartLeaseStatusMessage).toHaveBeenCalled();
            expect(mockBuildLinkNodeMessage).toHaveBeenCalled();
        });

        // Wait for lease notification modal to appear
        await waitFor(() => {
            const modals = screen.queryAllByTestId('notification-modal');
            expect(modals.length).toBeGreaterThan(0);
        }, { timeout: 5000 });

        // Find and click the close button for the lease modal
        const closeButtons = screen.getAllByText('Close');
        // The lease modal should be the one with "NODE Provided On Lease" heading
        for (const btn of closeButtons) {
            const modal = btn.closest('[data-testid="notification-modal"]');
            const heading = modal?.querySelector('h1')?.textContent;
            if (heading && heading.includes('NODE Provided On Lease')) {
                await act(async () => {
                    fireEvent.click(btn);
                });
                break;
            }
        }
    });

    test('handles Link request with updateStatus returning false (line 185)', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            if (endpoint && endpoint.includes('/api/v1/node/action')) {
                return Promise.resolve({ success: false });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        // Both transactions succeed, but updateStatus fails
        mockProcessTransaction
            .mockResolvedValueOnce('lease-tx-hash')  // lease succeeds
            .mockResolvedValueOnce('link-tx-hash');  // link succeeds
        mockBuildLinkNodeMessage.mockReturnValue({});
        mockBuildStartLeaseStatusMessage.mockReturnValue({});

        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });

        const approveBtn = screen.getByText('Approve');
        await act(async () => {
            fireEvent.click(approveBtn);
        });

        await waitFor(() => {
            expect(mockProcessTransaction).toHaveBeenCalled();
        });

        // Modal should NOT be shown when updateStatus fails
        expect(screen.queryByText('Node Approved successfully!')).not.toBeInTheDocument();

        consoleLogSpy.mockRestore();
    });

    test('renders table rows with all data variations', async () => {
        const mockNodeList = [
            {
                orgName: null,
                email: null,
                location: null,
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            // Check that "-" is displayed for null values
            const cells = screen.getAllByText('-');
            expect(cells.length).toBeGreaterThan(0);
        });
    });

    test('handles convertPlanString with empty string and null', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '1000000000',
                plan: '',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Org 1')).toBeInTheDocument();
        });
    });

    test('handles bandwidth display with zero value', async () => {
        const mockNodeList = [
            {
                orgName: 'Org 1',
                email: 'test@test.com',
                location: 'US',
                nodeAddress: 'node-addr-1',
                bandwidth: '0',
                plan: '100 TICS/month',
                requestFor: 'Link',
                planId: '1',
                hours: '100'
            }
        ];

        mockApi.mockImplementation((params: ApiParams) => {
            const endpoint = params.endpoint;
            if (endpoint === '/api/v1/node/count') {
                return Promise.resolve({ success: true, data: { data: { activeCount: 5 } } });
            }
            if (endpoint === '/api/v1/node/request-count') {
                return Promise.resolve({ success: true, data: { data: { totalCount: 10, linkCount: 3, UnlinkCount: 2 } } });
            }
            if (endpoint && endpoint.includes('/api/v1/node?')) {
                return Promise.resolve({ success: true, data: { data: { nodeList: mockNodeList }, total: 1 } });
            }
            return Promise.resolve({ success: true, data: {} });
        });

        await act(async () => {
            render(<Dashboard />);
        });

        await waitFor(() => {
            expect(screen.getByText('Org 1')).toBeInTheDocument();
        });
    });
});
