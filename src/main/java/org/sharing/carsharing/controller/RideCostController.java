package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.ride.RideCostRequest;
import org.sharing.carsharing.dto.ride.RideCostResponse;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.service.AdminAccessService;
import org.sharing.carsharing.service.RideCostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ride-cost")
@RequiredArgsConstructor
public class RideCostController {
    
    private final RideCostService rideCostService;
    private final AdminAccessService adminAccessService;
    
    @PostMapping("/calculate")
    public ResponseEntity<RideCostResponse> calculateCost(
            @RequestBody RideCostRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Извлекаем текущего пользователя из заголовка Authorization
        User user = adminAccessService.requireUser(authHeader);
        
        // Проверяем user.isBlocked() и user.isVerified()
        if (Boolean.TRUE.equals(user.getBlocked())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        if (!Boolean.TRUE.equals(user.getVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Рассчитываем стоимость
        RideCostResponse response = rideCostService.calculateCost(user, request);
        return ResponseEntity.ok(response);
    }
}