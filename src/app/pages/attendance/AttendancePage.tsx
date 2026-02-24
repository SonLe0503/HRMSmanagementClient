import React from 'react';
import TimeClock from './components/TimeClock';
import AttendanceHistoryTable from './components/AttendanceHistory';

const AttendancePage: React.FC = () => {
    const mockEmployeeId = 1;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>
            <TimeClock employeeId={mockEmployeeId} />
            <AttendanceHistoryTable employeeId={mockEmployeeId} />
        </div>
    );
};

export default AttendancePage;