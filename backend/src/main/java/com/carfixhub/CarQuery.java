package com.carfixhub;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "car_queries")
public class CarQuery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String carModel;

    @Column(nullable = false)
    private String serviceType;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 200)
    private String customerName;


    @Column(nullable = false, length = 20)
    private String mobileNumber;

    @Column(length = 1000)
    private String photoName;

    @Column(length = 1000)
    private String photoUrl1;

    @Column(length = 1000)
    private String photoUrl2;

    @Column(length = 1000)
    private String photoUrl3;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getCarModel() { return carModel; }
    public void setCarModel(String value) { this.carModel = value; }

public String getCustomerName() { return customerName; }
    public void setCustomerName   (String value) { this.customerName = value; }
    
    public String getServiceType() { return serviceType; }
    public void setServiceType(String value) { this.serviceType = value; }
    public String getDescription() { return description; }
    public void setDescription(String value) { this.description = value; }
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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant value) { this.createdAt = value; }
}
