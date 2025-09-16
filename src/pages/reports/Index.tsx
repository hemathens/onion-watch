import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, FileDown } from 'lucide-react';

const ReportsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+2%</p>
            <p className="text-xs text-muted-foreground">Healthy stock increase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-1.5%</p>
            <p className="text-xs text-muted-foreground">Compared to last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Q3 Peak</p>
            <p className="text-xs text-muted-foreground">Highest storage efficiency</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$4,800</p>
            <p className="text-xs text-muted-foreground">Total savings this year</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Custom Report Builder</CardTitle>
            <CardDescription>Generate a custom report based on your needs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Date Range</Label>
              <Button variant="outline" className="justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Pick a date range</span>
              </Button>
            </div>
            <div className="grid gap-2">
              <Label>Metrics</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2"><Checkbox id="losses" /> <Label htmlFor="losses">Losses</Label></div>
                <div className="flex items-center gap-2"><Checkbox id="savings" /> <Label htmlFor="savings">Savings</Label></div>
                <div className="flex items-center gap-2"><Checkbox id="quality" /> <Label htmlFor="quality">Quality Trends</Label></div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Export Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2"><FileDown className="h-4 w-4" /> Generate & Export</Button>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Analytics Visualizations</CardTitle>
            <CardDescription>Visual insights into your storage performance.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Storage Performance</h3>
              <p className="text-sm text-muted-foreground">Line graph showing quality trends over time will be here.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Loss Analysis</h3>
              <p className="text-sm text-muted-foreground">Pie chart showing loss reasons breakdown will be here.</p>
            </div>
            <div className="p-4 border rounded-lg col-span-2">
              <h3 className="font-semibold mb-2">Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">Forecasted storage performance and market timing recommendations will be here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
