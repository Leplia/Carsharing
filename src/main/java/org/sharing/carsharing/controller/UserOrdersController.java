package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.OrderResponseDto;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.service.AdminAccessService;
import org.sharing.carsharing.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserOrdersController {

    private final OrderService orderService;
    private final AdminAccessService adminAccessService;

    @GetMapping("/orders/active")
    public ResponseEntity<OrderResponseDto> getActiveOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = adminAccessService.requireUser(authHeader);
        OrderResponseDto activeOrder = orderService.getActiveOrder(user.getUserId());
        return ResponseEntity.ok(activeOrder);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDto>> getUserOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = adminAccessService.requireUser(authHeader);
        return ResponseEntity.ok(orderService.getUserOrders(user.getUserId()));
    }
}