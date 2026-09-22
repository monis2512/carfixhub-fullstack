export interface Enquiry {
  id: number;
  carModel: string;
  serviceType: string;
  description: string;
  customerName:string;
  mobileNumber: string;
  photoName: string;
  photoUrl1: string;
  photoUrl2: string;
  photoUrl3: string;
  createdAt: string;
}

export interface CreateQueryRequest {
  carModel: string;
  serviceType: string;
  description: string;
  customerName:string;
  mobileNumber: string;
  photoName: string;
  photoUrl1: string;
  photoUrl2: string;
  photoUrl3: string;
}

export interface ApiMessage {
  success?: boolean;
  id?: number;
  message?: string;
}
