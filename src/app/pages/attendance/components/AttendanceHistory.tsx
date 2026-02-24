import React, { useEffect, useState } from 'react';
import { attendanceApi } from '../../../../utils/attendanceApi';
import type { AttendanceHistory } from '../../../../interface';

interface Props {
    employeeId: number;
}

const AttendanceHistoryTable: React.FC<Props> = ({ employeeId }) => {
    const [data, setData] = useState<AttendanceHistory[]>([]);

    useEffect(() => {
        attendanceApi.getHistory(employeeId).then(res => setData(res.data));
    }, [employeeId]);

    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">My Attendance History</h3>
            <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">In</th>
                        <th className="border p-2">Out</th>
                        <th className="border p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-2">{row.date}</td>
                            <td className="border p-2">{row.shiftName}</td>
                            <td className="border p-2">
                                {row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-'}
                            </td>
                            <td className="border p-2">
                                {row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '-'}
                            </td>
                            <td className="border p-2">{row.totalHours?.toFixed(2) || '0.00'}</td>
                            <td className={`border p-2 font-bold ${row.status === 'Late' ? 'text-red-600' : 'text-green-600'}`}>
                                {row.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceHistoryTable;