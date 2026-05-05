package org.sharing.carsharing.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.sharing.carsharing.dto.CreateOrderRequest;
import org.sharing.carsharing.dto.EndOrderRequest;
import org.sharing.carsharing.dto.OrderResponseDto;
import org.sharing.carsharing.mapper.order.OrderMapper;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.Order;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.model.enums.OrderStatus;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.repository.OrderRepository;
import org.sharing.carsharing.repository.UserRepository;
import org.sharing.carsharing.service.impl.OrderServiceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CarsRepository carsRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User testUser;
    private Car testCar;
    private Order testOrder;
    private CreateOrderRequest createRequest;
    private EndOrderRequest endRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");

        testCar = new Car();
        testCar.setCarId(1L);
        testCar.setCarStatus(CarStatus.AVAILABLE);
        testCar.setFuelLevel(100);
        testCar.setLocationX(53.9045);
        testCar.setLocationY(27.5615);

        testOrder = new Order();
        testOrder.setOrderId(1L);
        testOrder.setUser(testUser);
        testOrder.setCar(testCar);
        testOrder.setStartTime(LocalDateTime.now().minusHours(1));
        testOrder.setStatus(OrderStatus.STARTED);
        testOrder.setPrice(45.67);
        testOrder.setDistance(0.0);
        testOrder.setSpendFuel(0.0);
        testOrder.setDiscount(0.0);

        createRequest = new CreateOrderRequest();
        createRequest.setCarId(1L);
        createRequest.setPrice(45.67);

        endRequest = new EndOrderRequest();
        endRequest.setDistanceKm(12.5);
        endRequest.setSpendFuel(2.5);
        endRequest.setNewLocationX(53.9050);
        endRequest.setNewLocationY(27.5620);
    }

    @Test
    void createOrder_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        
        OrderResponseDto expectedDto = new OrderResponseDto();
        expectedDto.setOrderId(1L);
        expectedDto.setStatus("STARTED");
        expectedDto.setPrice(45.67);
        when(orderMapper.toDto(any(Order.class))).thenReturn(expectedDto);

        // Act
        OrderResponseDto result = orderService.createOrder(1L, createRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
        assertEquals("STARTED", result.getStatus());
        assertEquals(45.67, result.getPrice());
        
        verify(userRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).save(testCar);
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderMapper, times(1)).toDto(any(Order.class));
        
        // Verify car status changed to IN_USE
        assertEquals(CarStatus.IN_USE, testCar.getCarStatus());
    }

    @Test
    void createOrder_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.createOrder(1L, createRequest));
        assertEquals("User not found: 1", exception.getMessage());
        
        verify(userRepository, times(1)).findById(1L);
        verify(carsRepository, never()).findById(anyLong());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_CarNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(carsRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.createOrder(1L, createRequest));
        assertEquals("Car not found: 1", exception.getMessage());
        
        verify(userRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_CarNotAvailable_ThrowsException() {
        // Arrange
        testCar.setCarStatus(CarStatus.IN_USE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.createOrder(1L, createRequest));
        assertEquals("Car is not available for order", exception.getMessage());
        
        verify(userRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void endOrder_Success() {
        // Arrange
        testOrder.setCar(testCar);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        
        OrderResponseDto expectedDto = new OrderResponseDto();
        expectedDto.setOrderId(1L);
        expectedDto.setStatus("COMPLETED");
        expectedDto.setPrice(45.67);
        expectedDto.setDistance(12.5);
        expectedDto.setSpendFuel(2.5);
        when(orderMapper.toDto(any(Order.class))).thenReturn(expectedDto);

        // Act
        OrderResponseDto result = orderService.endOrder(1L, endRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(12.5, result.getDistance());
        assertEquals(2.5, result.getSpendFuel());
        
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(testOrder);
        verify(carsRepository, times(1)).save(testCar);
        verify(orderMapper, times(1)).toDto(any(Order.class));
        
        // Verify order was updated
        assertEquals(OrderStatus.COMPLETED, testOrder.getStatus());
        assertNotNull(testOrder.getEndTime());
        assertEquals(12.5, testOrder.getDistance());
        assertEquals(2.5, testOrder.getSpendFuel());
        
        // Verify car was updated
        assertEquals(CarStatus.AVAILABLE, testCar.getCarStatus());
        assertEquals(97, testCar.getFuelLevel()); // 100 - 2.5 = 97.5, but cast to int
        assertEquals(53.9050, testCar.getLocationX());
        assertEquals(27.5620, testCar.getLocationY());
    }

    @Test
    void endOrder_OrderNotFound_ThrowsException() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.endOrder(1L, endRequest));
        assertEquals("Order not found: 1", exception.getMessage());
        
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void endOrder_OrderAlreadyCompleted_ThrowsException() {
        // Arrange
        testOrder.setStatus(OrderStatus.COMPLETED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> orderService.endOrder(1L, endRequest));
        assertEquals("Order already completed", exception.getMessage());
        
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void endOrder_WithoutOptionalFields_Success() {
        // Arrange
        testOrder.setCar(testCar);
        EndOrderRequest minimalRequest = new EndOrderRequest();
        // No distance, fuel, or location provided
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        
        OrderResponseDto expectedDto = new OrderResponseDto();
        expectedDto.setOrderId(1L);
        expectedDto.setStatus("COMPLETED");
        when(orderMapper.toDto(any(Order.class))).thenReturn(expectedDto);

        // Act
        OrderResponseDto result = orderService.endOrder(1L, minimalRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
        assertEquals("COMPLETED", result.getStatus());
        
        // Verify order was updated with default values
        assertEquals(0.0, testOrder.getDistance());
        assertEquals(0.0, testOrder.getSpendFuel());
        
        // Verify car status changed but fuel and location unchanged
        assertEquals(CarStatus.AVAILABLE, testCar.getCarStatus());
        assertEquals(100, testCar.getFuelLevel()); // unchanged
        assertEquals(53.9045, testCar.getLocationX()); // unchanged
        assertEquals(27.5615, testCar.getLocationY()); // unchanged
    }

    @Test
    void getActiveOrder_Found() {
        // Arrange
        when(orderRepository.findByUserUserIdAndStatus(1L, OrderStatus.STARTED))
            .thenReturn(Optional.of(testOrder));
        
        OrderResponseDto expectedDto = new OrderResponseDto();
        expectedDto.setOrderId(1L);
        expectedDto.setStatus("STARTED");
        when(orderMapper.toDto(testOrder)).thenReturn(expectedDto);

        // Act
        OrderResponseDto result = orderService.getActiveOrder(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
        assertEquals("STARTED", result.getStatus());
        
        verify(orderRepository, times(1)).findByUserUserIdAndStatus(1L, OrderStatus.STARTED);
        verify(orderMapper, times(1)).toDto(testOrder);
    }

    @Test
    void getActiveOrder_NotFound_ReturnsNull() {
        // Arrange
        when(orderRepository.findByUserUserIdAndStatus(1L, OrderStatus.STARTED))
            .thenReturn(Optional.empty());

        // Act
        OrderResponseDto result = orderService.getActiveOrder(1L);

        // Assert
        assertNull(result);
        verify(orderRepository, times(1)).findByUserUserIdAndStatus(1L, OrderStatus.STARTED);
        verify(orderMapper, never()).toDto(any(Order.class));
    }

    @Test
    void getUserOrders_Found() {
        // Arrange
        List<Order> orders = List.of(testOrder);
        when(orderRepository.findByUserUserIdOrderByStartTimeDesc(1L))
            .thenReturn(orders);
        
        OrderResponseDto expectedDto = new OrderResponseDto();
        expectedDto.setOrderId(1L);
        when(orderMapper.toDto(testOrder)).thenReturn(expectedDto);

        // Act
        List<OrderResponseDto> result = orderService.getUserOrders(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getOrderId());
        
        verify(orderRepository, times(1)).findByUserUserIdOrderByStartTimeDesc(1L);
        verify(orderMapper, times(1)).toDto(testOrder);
    }

    @Test
    void getUserOrders_EmptyList() {
        // Arrange
        when(orderRepository.findByUserUserIdOrderByStartTimeDesc(1L))
            .thenReturn(List.of());

        // Act
        List<OrderResponseDto> result = orderService.getUserOrders(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository, times(1)).findByUserUserIdOrderByStartTimeDesc(1L);
        verify(orderMapper, never()).toDto(any(Order.class));
    }
}