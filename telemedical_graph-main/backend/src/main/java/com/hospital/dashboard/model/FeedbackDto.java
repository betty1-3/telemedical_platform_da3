package com.hospital.dashboard.model;

public class FeedbackDto {
    private Long feedbackId;
    private String feedbackComment;
    private Integer rating;

    public FeedbackDto() {}

    public FeedbackDto(Long feedbackId, String feedbackComment, Integer rating) {
        this.feedbackId = feedbackId;
        this.feedbackComment = feedbackComment;
        this.rating = rating;
    }

    public Long getFeedbackId() { return feedbackId; }
    public void setFeedbackId(Long feedbackId) { this.feedbackId = feedbackId; }

    public String getFeedbackComment() { return feedbackComment; }
    public void setFeedbackComment(String feedbackComment) { this.feedbackComment = feedbackComment; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
