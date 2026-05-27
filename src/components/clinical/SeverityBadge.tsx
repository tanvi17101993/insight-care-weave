import { Badge } from "../ui/badge";
import { SEVERITY_BG_SOFT, SEVERITY_DOT, SEVERITY_LABEL, type Severity } from "../../lib/mock-data";

export function SeverityBadge({ severity, className = "" }: { severity: Severity; className?: string }) {
  return (
    <Badge variant="secondary" className={`gap-1.5 border-0 font-medium ${SEVERITY_BG_SOFT[severity]} ${className}`}>
      <span className={`size-1.5 rounded-full ${SEVERITY_DOT[severity]}`} />
      {SEVERITY_LABEL[severity]}
    </Badge>
  );
}
