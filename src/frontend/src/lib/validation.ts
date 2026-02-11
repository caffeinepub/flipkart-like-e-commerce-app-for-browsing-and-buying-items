export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateCheckoutForm(data: CheckoutFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = 'Phone number must be 10 digits';
  }

  if (!data.addressLine1.trim()) {
    errors.addressLine1 = 'Address is required';
  }

  if (!data.city.trim()) {
    errors.city = 'City is required';
  }

  if (!data.postalCode.trim()) {
    errors.postalCode = 'Postal code is required';
  } else if (!/^\d{6}$/.test(data.postalCode)) {
    errors.postalCode = 'Postal code must be 6 digits';
  }

  return errors;
}
