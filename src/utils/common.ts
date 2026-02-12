import { message } from 'antd';
import URL from '../constants/url';
import type { Location } from 'react-router-dom';

/**
 * Mapping URLs to Breadcrumb labels in English
 */
export const breadcrumbNameMap: Record<string, string> = {
    [URL.DashboardAdmin]: "Admin Dashboard",
    [URL.DashboardManage]: "Manager Dashboard",
    [URL.DashboardEmployee]: "Employee Dashboard",
    [URL.DashboardHR]: "HR Dashboard",
    [URL.ManageUser]: "User Management",
    [URL.ManageRole]: "Role Management",
    [URL.ManageWorkflow]: "Workflow Management",
    [URL.ManageCategory]: "Category Management",
    [URL.ManageProduct]: "Product Management",
};

/**
 * Generates breadcrumb items based on current location
 */
export const getBreadcrumbItems = (location: Location) => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    return pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return {
            key: url,
            title: breadcrumbNameMap[url] || pathSnippets[index].charAt(0).toUpperCase() + pathSnippets[index].slice(1).replace(/-/g, ' '),
        };
    });
};

/**
 * Standardizes API error handling and notification
 */
export const handleError = (error: any, defaultMsg = "An error occurred") => {
    const msg = typeof error === 'string' ? error : error?.message || defaultMsg;
    message.error(msg);
};

/**
 * Generates a consistent HEX color based on a string hash
 * @param string The input string (e.g., username or ID)
 * @returns A HEX color string from a pre-defined palette
 */
export const stringToColor = (string: string): string => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
        '#1890ff', '#52c41a', '#eb2f96', '#fa541c',
        '#13c2c2', '#722ed1', '#2f54eb'
    ];
    return colors[Math.abs(hash) % colors.length];
};

/**
 * Gets the first character of a string and converts it to uppercase
 * @param name The input string
 * @returns A single uppercase character or "?" if empty
 */
export const getInitial = (name?: string): string => {
    return name ? name.charAt(0).toUpperCase() : "?";
};
