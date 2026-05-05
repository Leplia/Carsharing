package org.sharing.carsharing.service;

import org.sharing.carsharing.dto.CreateOrderRequest;
import org.sharing.carsharing.dto.EndOrderRequest;
import org.sharing.carsharing.dto.OrderResponseDto;

import java.util.List;

public interface OrderService {
    OrderResponseDto createOrder(Long userId, CreateOrderRequest request);
    OrderResponseDto endOrder(Long orderId, EndOrderRequest request);
    OrderResponseDto getActiveOrder(Long userId);
    List<OrderResponseDto> getUserOrders(Long userId);
}