export const LEAD_SOURCES = [

    'website',
    'linkedin',
    'referral',
    'event'
];
export const STATUSES = [
    'new',
    'contacted',
    'qualified',
    'lost'
];
export const PRIORITIES = ['high', 'medium', 'low'];
const EMAIL_RE = /^[^\s@]+@[^\s@] + \.[^\s@] + $/;
const   PHONE_RE = /^\+?\d{7,15}$/;
const AMOUNT_RE = /^\d{1,10}(\.\d{1,2})?$/;

export function validationLead(body){
    const errors ={};
    const text = (key) => 
        typeof body[key] == 'string' ? body[key].trim() : '';
    const fullName = text('fullName');
    if (fullName.length < 2 || fullName.length>100){
        errors.fullName = 'Ful;l name must be 2-100.';

    }
    const email= text('email');
    if(!email || email.length > 254 || ! EMAIL_RE.test(email)){
        errors.email = 'enter a valid email address.';
    }
    const companyName = text('companyName');
    if(!companyName || companyName.length > 150){
        errors.companyName= 'max 150 characters.';
    }
      const phone = text('phone');
    if(!PHONE_RE.test(phone)){
        errors.phone= 'between 7-15 digits..';
    }
  return {
    errors: Object.keys(erros).length ? errors : null,
    value: {
        fullName,
        email,
        companyName,
        phone
    }
  };

    
  
}
export function priorityFor(amount){
    if(amount >=100000) return 'high';
    if(amount >= 50000) return 'medium';
    return 'low'
}