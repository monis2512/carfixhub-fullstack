package com.carfixhub;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CarQueryRepository extends JpaRepository<CarQuery, Long> {
    List<CarQuery> findAllByOrderByCreatedAtDesc();
}
