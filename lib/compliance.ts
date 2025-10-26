export const FTC_DISCLOSURE = `
As an Amazon Associate and affiliate partner with other retailers, we earn from qualifying purchases. 
This means we may receive a commission if you purchase through our links, at no additional cost to you.
`.trim();

export const AMAZON_ASSOCIATES_NOTICE = `
CERTAIN CONTENT THAT APPEARS ON THIS SITE COMES FROM AMAZON. THIS CONTENT IS PROVIDED 'AS IS' 
AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME.
`.trim();

export function addDisclosure(content: string): string {
  return `${content}\n\n---\n\n**Disclosure:** ${FTC_DISCLOSURE}`;
}

export const RATE_LIMITS = {
  amazonProductAPI: 1000, // per day
  priceCheckInterval: 3600000, // 1 hour in ms
  socialPostInterval: 300000, // 5 minutes in ms
};
