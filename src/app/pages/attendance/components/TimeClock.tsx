import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { attendanceApi } from '../../../../utils/attendanceApi';
import { SYSTEM_MESSAGES } from '../../../../constants/messages';
import type { AttendanceResponse } from '../../../../interface/attendance';

interface ApiError {
    message: string;
}

interface Props {
    employeeId: number;
}

const TimeClock: React.FC<Props> = ({ employeeId }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [lastAction, setLastAction] = useState<AttendanceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAction = async (type: 'in' | 'out') => {
        setLoading(true);
        setError(null);
        try {
            const res = type === 'in'
                ? await attendanceApi.checkIn({ employeeId })
                : await attendanceApi.checkOut(employeeId);

            setLastAction(res.data);
        } catch (err) { 
            const axiosError = err as AxiosError<ApiError>;
            const code = axiosError.response?.data?.message || "MSG-SYS-01";
            setError(SYSTEM_MESSAGES[code] || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">Daily Attendance</h3>

            <div className="flex gap-4">
                <button
                    disabled={loading}
                    onClick={() => handleAction('in')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    Check In
                </button>
                <button
                    disabled={loading}
                    onClick={() => handleAction('out')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    Check Out
                </button>
            </div>

            {lastAction && (
                <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded text-sm">
                    {SYSTEM_MESSAGES[lastAction.message]} Status: <strong>{lastAction.status}</strong>
                </div>
            )}

            {error && (
                <div className="mt-4 p-2 bg-red-50 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default TimeClock;