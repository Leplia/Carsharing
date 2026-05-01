package org.sharing.carsharing.repository;

import org.sharing.carsharing.model.CarPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarPhotoRepository extends JpaRepository<CarPhoto, Long> {
    List<CarPhoto> findAllByCarCarIdOrderBySortOrderAsc(Long carId);
    Optional<CarPhoto> findByCarCarIdAndIsMainTrue(Long carId);
    void deleteAllByCarCarId(Long carId);
}
