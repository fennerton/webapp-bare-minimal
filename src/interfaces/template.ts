export interface Template {
  Arn: string;
  CreationDate: string;
  DefaultSubstitutions: string;
  HtmlPart: string;
  LastModifiedDate: string;
  Subject: string;
  RecommenderId: string;
  Headers: [
    {
      Name: string;
      Value: string;
    },
  ];
  tags: {
    [key: string]: string;
  };
  TemplateName: string;
  TextPart: string;
  TemplateType: "EMAIL" | "SMS" | "VOICE" | "PUSH" | "INAPP";
  Version: string;
  TemplateDescription: string;
}
