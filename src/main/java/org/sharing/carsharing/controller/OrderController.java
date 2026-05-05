package org.sharing.carsharing.controller;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.CreateOrderRequest;
import org.sharing.carsharing.dto.EndOrderRequest;
import org.sharing.carsharing.dto.OrderResponseDto;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.service.AdminAccessService;
import org.sharing.carsharing.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AdminAccessService adminAccessService;

    @PostMapping("/create")
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestBody CreateOrderRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User user = adminAccessService.requireUser(authHeader);
        return ResponseEntity.ok(orderService.createOrder(user.getUserId(), request));
    }

    @PutMapping("/{orderId}/end")
    public ResponseEntity<OrderResponseDto> endOrder(
            @PathVariable Long orderId,
            @RequestBody EndOrderRequest request,
            @RequestHeader("Authorization") String authHeader) {
        adminAccessService.requireUser(authHeader);
        return ResponseEntity.ok(orderService.endOrder(orderId, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(
            @RequestHeader("Authorization") String authHeader) {
        User user = adminAccessService.requireUser(authHeader);
        return ResponseEntity.ok(orderService.getUserOrders(user.getUserId()));
    }
}