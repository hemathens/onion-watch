import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const SupportPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitTicket = () => {
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject for your ticket.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please describe your issue or question.",
        variant: "destructive"
      });
      return;
    }

    // Generate ticket ID
    const ticketId = `TICKET-${Date.now().toString().slice(-6)}`;

    toast({
      title: "Support Ticket Submitted",
      description: `Your ticket ${ticketId} has been submitted successfully. We'll respond within 24 hours.`,
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="col-span-3 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Have a question or need help? Fill out the form below.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="How can we help?"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Describe your issue..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </div>
            <Button onClick={handleSubmitTicket}>Submit Ticket</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I add a new batch?</AccordionTrigger>
              <AccordionContent>
                You can add a new batch from the main dashboard by clicking the "Add New Batch" button, or by navigating to the AI Predictions page to upload images for a new batch.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How accurate are the AI predictions?</AccordionTrigger>
              <AccordionContent>
                Our AI model is trained on a vast dataset of onion images and provides high-accuracy predictions. The confidence score indicates the model's certainty, and we continuously work to improve its performance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I export my data?</AccordionTrigger>
              <AccordionContent>
                Yes, you can generate and export custom reports in PDF, Excel, or CSV format from the Reports & Analytics page.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What do the different alert levels mean?</AccordionTrigger>
              <AccordionContent>
                Critical alerts require immediate attention, Warning alerts indicate potential issues, and Info alerts provide general updates. You can configure your notification preferences in the Alerts dashboard.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
