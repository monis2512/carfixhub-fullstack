package com.carfixhub;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/queries")
public class CarQueryController {
    private final CarQueryRepository repo;

    public CarQueryController(CarQueryRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateQueryRequest r) {
        if (blank(r.getCarModel()) || blank(r.getServiceType()) || blank(r.getDescription()) || blank(r.getMobileNumber())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Car, service, description and mobile number are required."));
        }

        String mobile = r.getMobileNumber().replaceAll("\\s+", "");
        if (!mobile.matches("^[6-9][0-9]{9}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid 10-digit Indian mobile number."));
        }

        CarQuery q = new CarQuery();
        q.setCarModel(r.getCarModel().trim());
        q.setServiceType(r.getServiceType().trim());
        q.setDescription(r.getDescription().trim());
        q.setCustomerName(r.getCustomerName().trim());
        q.setMobileNumber(mobile);
        q.setPhotoName(clean(r.getPhotoName()));
        q.setPhotoUrl1(clean(r.getPhotoUrl1()));
        q.setPhotoUrl2(clean(r.getPhotoUrl2()));
        q.setPhotoUrl3(clean(r.getPhotoUrl3()));

        CarQuery saved = repo.save(q);
        return ResponseEntity.ok(Map.of("success", true, "id", saved.getId(), "message", "Enquiry submitted successfully."));
    }

    private boolean blank(String value) { return value == null || value.trim().isEmpty(); }
    private String clean(String value) { return value == null ? "" : value.trim(); }
}
