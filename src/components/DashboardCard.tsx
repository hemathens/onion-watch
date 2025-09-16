import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const DashboardCard = ({ title, value, icon, trend, trendDirection }: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs text-muted-foreground flex items-center ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
