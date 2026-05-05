package org.sharing.carsharing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.sharing.carsharing.dto.ride.RideCostRequest;
import org.sharing.carsharing.dto.ride.RideCostResponse;
import org.sharing.carsharing.exception.AccessDeniedException;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.service.AdminAccessService;
import org.sharing.carsharing.service.RideCostService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RideCostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RideCostService rideCostService;

    @MockBean
    private AdminAccessService adminAccessService;

    @Test
    void calculateCost_ValidRequest_ReturnsOk() throws Exception {
        // Arrange
        User user = new User();
        user.setUserId(1L);
        user.setLogin("testuser");
        user.setBlocked(false);
        user.setVerified(true);
        user.setRole(Role.USER);

        RideCostRequest request = new RideCostRequest();
        request.setCarId(1L);
        request.setDistanceKm(10.0);

        RideCostResponse response = new RideCostResponse();
        response.setTotalCost(60.0);
        response.setBaseRate(4.0);
        response.setCoefficient(1.5);
        response.setDiscountPercent(0.0);
        response.setDistanceKm(10.0);

        when(adminAccessService.requireUser(anyString())).thenReturn(user);
        when(rideCostService.calculateCost(any(User.class), any(RideCostRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/ride-cost/calculate")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCost").value(60.0))
                .andExpect(jsonPath("$.baseRate").value(4.0))
                .andExpect(jsonPath("$.coefficient").value(1.5))
                .andExpect(jsonPath("$.discountPercent").value(0.0))
                .andExpect(jsonPath("$.distanceKm").value(10.0));
    }

    @Test
    void calculateCost_UserBlocked_ReturnsForbidden() throws Exception {
        // Arrange
        User user = new User();
        user.setUserId(1L);
        user.setLogin("testuser");
        user.setBlocked(true);
        user.setVerified(true);
        user.setRole(Role.USER);

        RideCostRequest request = new RideCostRequest();
        request.setCarId(1L);
        request.setDistanceKm(10.0);

        when(adminAccessService.requireUser(anyString())).thenReturn(user);

        // Act & Assert
        mockMvc.perform(post("/api/ride-cost/calculate")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void calculateCost_UserNotVerified_ReturnsForbidden() throws Exception {
        // Arrange
        User user = new User();
        user.setUserId(1L);
        user.setLogin("testuser");
        user.setBlocked(false);
        user.setVerified(false);
        user.setRole(Role.USER);

        RideCostRequest request = new RideCostRequest();
        request.setCarId(1L);
        request.setDistanceKm(10.0);

        when(adminAccessService.requireUser(anyString())).thenReturn(user);

        // Act & Assert
        mockMvc.perform(post("/api/ride-cost/calculate")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void calculateCost_NoAuthHeader_ReturnsUnauthorized() throws Exception {
        // Arrange
        RideCostRequest request = new RideCostRequest();
        request.setCarId(1L);
        request.setDistanceKm(10.0);

        when(adminAccessService.requireUser(null)).thenThrow(new AccessDeniedException("Требуется токен авторизации"));

        // Act & Assert
        mockMvc.perform(post("/api/ride-cost/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden()); // AccessDeniedException обрабатывается как 403
    }
}