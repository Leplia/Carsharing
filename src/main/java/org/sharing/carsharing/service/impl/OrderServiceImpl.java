package org.sharing.carsharing.service.impl;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.dto.CreateOrderRequest;
import org.sharing.carsharing.dto.EndOrderRequest;
import org.sharing.carsharing.dto.OrderResponseDto;
import org.sharing.carsharing.mapper.order.OrderMapper;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.Order;
import org.sharing.carsharing.model.Payment;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.model.enums.OrderStatus;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.repository.OrderRepository;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CarsRepository carsRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponseDto createOrder(Long userId, CreateOrderRequest request) {
        if (request.getCarId() == null || request.getCarId() <= 0) {
            throw new RuntimeException("Invalid car ID: " + request.getCarId());
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Car car = carsRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found: " + request.getCarId()));

        if (car.getCarStatus() != CarStatus.BOOKED && car.getCarStatus() != CarStatus.AVAILABLE) {
            throw new RuntimeException("Car is not available for order");
        }

        car.setCarStatus(CarStatus.IN_USE);
        carsRepository.save(car);

        Order order = new Order();
        order.setUser(user);
        order.setCar(car);
        order.setStatus(OrderStatus.STARTED);
        
        order.setDistance(0.0);
        order.setSpendFuel(0.0);
        order.setPrice(0.0);
        
        Payment payment = new Payment();
        payment.setPrice(0.0); // Временное значение
        payment.setCheque("CHQ-" + System.currentTimeMillis() + "-" + userId);
        order.setPayment(payment);
        
        order.setRatingEdits(0.0f);

        return orderMapper.toDto(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponseDto endOrder(Long orderId, EndOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Order already completed");
        }

        Double distanceKm = request.getDistanceKm() != null ? request.getDistanceKm() : 10.0;
        order.setDistance(distanceKm);
        
        Double spendFuel = (distanceKm * 15.0) / 100.0;
        order.setSpendFuel(spendFuel);
        

        Double price = distanceKm * 4.0;
        order.setPrice(price);
        
        order.getPayment().setPrice(price);
        
        order.setStatus(OrderStatus.COMPLETED);
        
        Car car = order.getCar();
        
        int newFuel = (int) Math.max(0, car.getFuelLevel() - spendFuel);
        car.setFuelLevel(newFuel);
        
        if (request.getNewLocationX() != null && request.getNewLocationY() != null) {
            car.setLocationX(request.getNewLocationX());
            car.setLocationY(request.getNewLocationY());
        }
        
        Float ratingChange = (float) (Math.random() * 0.3 - 0.2);
        order.setRatingEdits(ratingChange);
        
        car.setCarStatus(CarStatus.AVAILABLE);
        carsRepository.save(car);

        return orderMapper.toDto(orderRepository.save(order));
    }

    @Override
    public OrderResponseDto getActiveOrder(Long userId) {
        return orderRepository.findByUserUserIdAndStatus(userId, OrderStatus.STARTED)
                .map(orderMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<OrderResponseDto> getUserOrders(Long userId) {
        return orderRepository.findByUserUserIdOrderByOrderIdDesc(userId)
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }
}