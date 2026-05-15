import { useState, useEffect } from "react";
import useMessage from "../hooks/useMessage";
import "../styles/index.css";

function Contact() {
  const { createMessage } = useMessage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid.";
    }
    if (!formData.message.trim())
      newErrors.message = "Message cannot be empty.";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError("Please fix the errors below before submitting.");
      setSuccessMessage("");
      return;
    }

    setErrors({});
    setSubmitError("");
    setLoading(true);

    try {
      await createMessage(formData);

      setSuccessMessage("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setSubmitError("Error submitting form. Please try again.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact-header">
        <h1>
          Contact <span>Us</span>
        </h1>
        <p className="contact-lead">
          Have questions, feedback, or suggestions? We'd love to hear from you.
          Fill out the form and our team will get back to you.
        </p>
      </div>

      <div className="contact-body">
        {submitError && <div className="form-error-box">{submitError}</div>}
        {successMessage && (
          <div className="form-success-box">{successMessage}</div>
        )}

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <p className="form-error-msg">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <p className="form-error-msg">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              placeholder="Your message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? "input-error" : ""}
            />
            {errors.message && (
              <p className="form-error-msg">{errors.message}</p>
            )}
          </div>

          <button type="submit" className="cta-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
