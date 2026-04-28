package org.sharing.carsharing.repository;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.enums.CarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarsRepository extends JpaRepository<Car, Long> {
    List<Car> findAllByCarStatus(CarStatus carStatus);
}
