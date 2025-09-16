import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, QrCode, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BatchDetailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Batch ON-089
            </h1>
            <Badge variant="warning" className="ml-auto sm:ml-0">
                At Risk
            </Badge>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">Discard</Button>
                <Button size="sm">Save</Button>
            </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Batch Details</CardTitle>
                        <CardDescription>All information related to batch ON-089.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="font-medium">Storage Location</p>
                            <p className="text-muted-foreground">Natural Ventilation B</p>
                        </div>
                        <div>
                            <p className="font-medium">Harvest Date</p>
                            <p className="text-muted-foreground">July 15, 2024</p>
                        </div>
                        <div>
                            <p className="font-medium">Initial Quantity</p>
                            <p className="text-muted-foreground">1200 kg</p>
                        </div>
                        <div>
                            <p className="font-medium">Current Quantity</p>
                            <p className="text-muted-foreground">1180 kg</p>
                        </div>
                        <div>
                            <p className="font-medium">Storage Method</p>
                            <p className="text-muted-foreground">Natural Ventilation</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Prediction Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Graph showing quality degradation curve will be here.</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Status</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="font-semibold">Quality Score: 48%</div>
                        <p className="text-sm text-muted-foreground">Recommended Action: Increase ventilation and monitor for sprouting. Consider for immediate sale.</p>
                        <Button size="sm" variant="outline" className="gap-1">
                            <QrCode className="h-3.5 w-3.5" />
                            Scan QR Code
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Batch</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Form to update quantity, add notes, and upload new images will be here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default BatchDetailPage;
