package com.hospital.dashboard.model;

import java.math.BigDecimal;

/**
 * Maps to the PAYMENT table.
 * NOTE: real Oracle columns are payment_amount and paid_by - there is no
 * payment_date or payment_status column. See PaymentRepository.
 */
public class Payment {

    private Long paymentId;
    private Long consultationId;
    private BigDecimal amount;
    private String paidBy;

    public Payment() { }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Long getConsultationId() { return consultationId; }
    public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }
}
