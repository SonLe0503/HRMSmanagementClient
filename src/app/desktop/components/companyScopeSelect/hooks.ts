import { useAppSelector } from "../../../../store";
import { selectInfoLogin } from "../../../../store/authSlide";
import { selectScopeCompanyId } from "../../../../store/companySlide";
import { EUserRole } from "../../../../interface/app";

/** True for the SuperAdmin, who must pick a company before configuring roles, permissions or role menus. */
export const useIsSuperAdmin = () => useAppSelector(selectInfoLogin)?.role === EUserRole.SUPERADMIN;

/**
 * `ready`: requests can go out (company users always work on their own company; the SuperAdmin
 * must have picked one). `scopeKey`: changes whenever the configured company changes, so pages can
 * use it as an effect dependency or a React key to reload.
 */
export const useConfigScope = (): { ready: boolean; scopeKey: number | "own" } => {
  const isSuperAdmin = useIsSuperAdmin();
  const scopeCompanyId = useAppSelector(selectScopeCompanyId);
  if (!isSuperAdmin) return { ready: true, scopeKey: "own" };
  return { ready: scopeCompanyId != null, scopeKey: scopeCompanyId ?? -1 };
};
