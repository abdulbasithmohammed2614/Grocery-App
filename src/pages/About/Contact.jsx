import React, { useState } from "react";
import { Link } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import Swal from "sweetalert2";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    comments: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      Swal.fire("Required", "Please fill in your name and email address.", "warning");
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Inquiry Received!",
      text: `Thank you ${formData.firstName}, our retail partner support team will contact you at ${formData.email} within 24 hours.`,
      confirmButtonColor: "#0aad0a",
    });

    setFormData({
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      comments: "",
    });
  };

  return (
    <div className="bg-light py-5" style={{ minHeight: "80vh" }}>
      <ScrollToTop />
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Contact &amp; Support
            </li>
          </ol>
        </nav>

        <div className="row justify-content-center">
          <div className="col-lg-8 col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <div className="mb-4">
                <span className="badge bg-success p-2 mb-2">⚡ 24/7 Customer Support</span>
                <h2 className="fw-bold mb-2">Contact &amp; Retail Inquiries</h2>
                <p className="text-muted">
                  Have questions about your quick grocery order, want to partner as a darkstore merchant, or need assistance? Fill out the form below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Rahul"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Sharma"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">
                    Store / Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. Fresh Daily Mart (or leave blank if individual customer)"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">
                    Message / Inquiry Details
                  </label>
                  <textarea
                    rows={4}
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="How can we assist you today?"
                  />
                </div>

                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-success px-5 py-2 fw-bold rounded-pill shadow-sm">
                    Submit Inquiry →
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
