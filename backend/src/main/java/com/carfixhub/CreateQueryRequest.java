package com.carfixhub;

public class CreateQueryRequest {
    private String carModel;
    private String serviceType;
    private String description;
    private String customerName;
    private String mobileNumber;
    private String photoName;
    private String photoUrl1;
    private String photoUrl2;
    private String photoUrl3;

    public String getCarModel() { return carModel; }
    public void setCarModel(String value) { this.carModel = value; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String value) { this.serviceType = value; }
    public String getDescription() { return description; }
    public void setDescription(String value) { this.description = value; }

public String getCustomerName() { return customerName; }
    public void setCustomerName(String value) { this.customerName = value; }
    
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String value) { this.mobileNumber = value; }
    public String getPhotoName() { return photoName; }
    public void setPhotoName(String value) { this.photoName = value; }
    public String getPhotoUrl1() { return photoUrl1; }
    public void setPhotoUrl1(String value) { this.photoUrl1 = value; }
    public String getPhotoUrl2() { return photoUrl2; }
    public void setPhotoUrl2(String value) { this.photoUrl2 = value; }
    public String getPhotoUrl3() { return photoUrl3; }
    public void setPhotoUrl3(String value) { this.photoUrl3 = value; }
}
