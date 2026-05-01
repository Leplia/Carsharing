package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.AdminStatsDto;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.repository.ReviewRepository;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.service.AdminAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminAccessService adminAccessService;
    private final UserRepository userRepository;
    private final CarsRepository carsRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        adminAccessService.requireAnyRole(authHeader, Role.ADMIN, Role.SISADMIN);

        AdminStatsDto dto = new AdminStatsDto();
        dto.setTotalUsers(userRepository.count());
        dto.setVerifiedUsers(userRepository.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getVerified())).count());
        dto.setBlockedUsers(userRepository.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getBlocked())).count());
        dto.setTotalCars(carsRepository.count());
        dto.setAvailableCars(carsRepository.findAllByCarStatus(CarStatus.AVAILABLE).size());
        dto.setOutOfServiceCars(carsRepository.findAllByCarStatus(CarStatus.OUT_OF_SERVICE).size());
        dto.setTotalReviews(reviewRepository.count());
        dto.setUnansweredReviews(reviewRepository.findAll().stream()
                .filter(r -> r.getAdminReply() == null || r.getAdminReply().isBlank())
                .count());
        return ResponseEntity.ok(dto);
    }
}
