package org.sharing.carsharing.repository;

import org.sharing.carsharing.model.CarManufacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarManufactureRepository extends JpaRepository<CarManufacture, Long> {
}