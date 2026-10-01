import { useEffect, type ReactNode } from "react";
import { Result, Select, Space, Typography } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchCompanies,
  selectCompanies,
  selectCompaniesLoading,
  selectScopeCompanyId,
  setScopeCompany,
} from "../../../../store/companySlide";
import { useIsSuperAdmin } from "./hooks";

const { Text } = Typography;

/** Guards pages whose API is SuperAdmin-only, so a company user opening the URL directly gets a clear message. */
export const SuperAdminOnly = ({ children }: { children: ReactNode }) => {
  const isSuperAdmin = useIsSuperAdmin();
  if (isSuperAdmin) return <>{children}</>;
  return (
    <Result
      status="403"
      title="Chức năng do quản trị hệ thống quản lý"
      subTitle="Vai trò, phân quyền và menu được cấu hình bởi SuperAdmin. Liên hệ quản trị hệ thống nếu cần thay đổi."
    />
  );
};

/** Company picker shown to the SuperAdmin on configuration pages; renders nothing for company users. */
const CompanyScopeSelect = () => {
  const dispatch = useAppDispatch();
  const isSuperAdmin = useIsSuperAdmin();
  const companies = useAppSelector(selectCompanies);
  const loading = useAppSelector(selectCompaniesLoading);
  const scopeCompanyId = useAppSelector(selectScopeCompanyId);

  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchCompanies());
  }, [dispatch, isSuperAdmin]);

  // Default to the first active company so the page never opens empty
  useEffect(() => {
    if (!isSuperAdmin || companies.length === 0) return;
    if (scopeCompanyId == null || !companies.some((c) => c.companyId === scopeCompanyId)) {
      const first = companies.find((c) => c.isActive) ?? companies[0];
      dispatch(setScopeCompany(first.companyId));
    }
  }, [dispatch, isSuperAdmin, companies, scopeCompanyId]);

  if (!isSuperAdmin) return null;

  return (
    <Space>
      <Text type="secondary">
        <BankOutlined /> Công ty:
      </Text>
      <Select
        style={{ width: 260 }}
        showSearch
        optionFilterProp="label"
        loading={loading}
        placeholder="Chọn công ty cần cấu hình"
        value={scopeCompanyId ?? undefined}
        onChange={(id: number) => dispatch(setScopeCompany(id))}
        options={companies.map((c) => ({
          value: c.companyId,
          label: `${c.companyCode} · ${c.companyName}${c.isActive ? "" : " (đã khóa)"}`,
        }))}
      />
    </Space>
  );
};

export default CompanyScopeSelect;
