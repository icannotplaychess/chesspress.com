export function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`cp-wrap ${className}`.trim()}>{children}</div>;
}
