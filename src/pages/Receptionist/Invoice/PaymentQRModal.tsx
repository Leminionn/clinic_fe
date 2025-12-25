import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	CircularProgress,
	Alert,
	Chip,
	Divider,
} from "@mui/material";
import {
	CheckCircle as SuccessIcon,
	Error as ErrorIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../../auth/AuthContext";
import { apiCall } from "../../../api/api";
import {
	paymentCreatePayment,
	paymentGetPaymentRequest,
	paymentVerifyPayment,
} from "../../../api/urls";
import type { InvoiceDetail, PaymentLinkResponse } from "../../../types/Invoice";

interface PaymentMethod {
	paymentMethodId: number;
	methodCode: string;
	methodName: string;
}

interface PaymentQRModalProps {
	open: boolean;
	onClose: () => void;
	invoice: InvoiceDetail;
	onPaymentSuccess: () => void;
	role?: string;
	paymentMethod?: PaymentMethod | null;
}

type PaymentState = "loading" | "created" | "checking" | "success" | "error" | "cancelled";

const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
	open,
	onClose,
	invoice,
	onPaymentSuccess,
	role = "receptionist",
	paymentMethod,
}) => {
	const { token, user } = useAuth();
	const [paymentState, setPaymentState] = useState<PaymentState>("loading");
	const [paymentLink, setPaymentLink] = useState<PaymentLinkResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [countdown, setCountdown] = useState(0);
	const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	// Generate payment reference code
	// Format: INV[invoiceId in base36][amount last 4 digits][random 4 chars]
	// Example: INV1A2B3400XYZW - related to invoice but looks like a code
	const generatePaymentCode = useCallback(() => {
		const invIdBase36 = invoice.invoiceId.toString(36).toUpperCase().padStart(4, '0');
		const amountPart = (invoice.totalAmount % 10000).toString().padStart(4, '0');
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		let randomPart = '';
		for (let i = 0; i < 4; i++) {
			randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return `INV${invIdBase36}${amountPart}${randomPart}`;
	}, [invoice.invoiceId, invoice.totalAmount]);

	// Get VietQR template based on payment method for different visual appearance
	const getVietQRTemplate = useCallback(() => {
		if (!paymentMethod?.methodCode) return "compact2";
		
		const code = paymentMethod.methodCode.toUpperCase();
		// Different templates for different payment methods (visual difference only)
		if (code.includes("MOMO") || code.includes("MO_MO")) return "compact";
		if (code.includes("ZALO") || code.includes("ZALOPAY")) return "qr_only";
		if (code.includes("VIETQR") || code.includes("QR")) return "print";
		if (code.includes("BANK") || code.includes("TRANSFER")) return "compact2";
		return "compact2";
	}, [paymentMethod]);

	// Store the payment code so it doesn't change on re-renders
	const paymentCodeRef = useRef<string>("");
	if (!paymentCodeRef.current) {
		paymentCodeRef.current = generatePaymentCode();
	}

	// Generate VietQR URL for direct banking app payment
	const generateVietQRUrl = useMemo(() => {
		if (!paymentLink?.bin || !paymentLink?.accountNumber) return null;
		
		const bin = paymentLink.bin;
		const accountNumber = paymentLink.accountNumber;
		// Divide by 100 for demo purposes (smaller amount)
		const originalAmount = paymentLink.amount || invoice.totalAmount;
		const demoAmount = Math.round(originalAmount / 100);
		const description = encodeURIComponent(paymentCodeRef.current);
		const accountName = encodeURIComponent(paymentLink.accountName || "");
		const template = getVietQRTemplate();
		
		// VietQR format: https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>
		return `https://img.vietqr.io/image/${bin}-${accountNumber}-${template}.png?amount=${demoAmount}&addInfo=${description}&accountName=${accountName}`;
	}, [paymentLink, invoice.totalAmount, invoice.invoiceId, getVietQRTemplate]);

	const clearIntervals = useCallback(() => {
		if (checkIntervalRef.current) {
			clearInterval(checkIntervalRef.current);
			checkIntervalRef.current = null;
		}
		if (countdownIntervalRef.current) {
			clearInterval(countdownIntervalRef.current);
			countdownIntervalRef.current = null;
		}
	}, []);

	const createPaymentLink = useCallback(() => {
		setPaymentState("loading");
		setError(null);

		const staffId = (user as any)?.staffId || 1;
		const requestBody = JSON.stringify({
			invoiceId: invoice.invoiceId,
			staffId: staffId,
			description: `Payment for invoice #${invoice.invoiceId}`,
			returnUrl: window.location.href,
			cancelUrl: window.location.href,
		});

		apiCall(
			paymentCreatePayment(role),
			"POST",
			token,
			requestBody,
			(response: { data: PaymentLinkResponse }) => {
				setPaymentLink(response.data);
				setPaymentState("created");
				// Set countdown for 15 minutes (900 seconds)
				setCountdown(900);
			},
			(err: any) => {
				console.error("Error creating payment link:", err);
				setError(err.message || "Failed to create payment link");
				setPaymentState("error");
			}
		);
	}, [invoice.invoiceId, token, role, user]);

	const checkPaymentStatus = useCallback(() => {
		if (!paymentLink) return;

		apiCall(
			paymentGetPaymentRequest(role, paymentLink.orderCode),
			"GET",
			token,
			null,
			(response: { data: any }) => {
				const status = response.data.status;
				if (status === "PAID") {
					clearIntervals();
					// Verify and update invoice
					verifyPayment(paymentLink.orderCode);
				} else if (status === "CANCELLED" || status === "EXPIRED") {
					clearIntervals();
					setPaymentState("cancelled");
					setError("Payment was cancelled or expired");
				}
				// else keep checking
			},
			(err: any) => {
				console.error("Error checking payment status:", err);
			}
		);
	}, [paymentLink, token, role, clearIntervals]);

	const verifyPayment = useCallback(
		(orderCode: number) => {
			setPaymentState("checking");

			const requestBody = JSON.stringify({
				orderCode: orderCode,
				invoiceId: invoice.invoiceId,
			});

			apiCall(
				paymentVerifyPayment(role),
				"POST",
				token,
				requestBody,
				() => {
					setPaymentState("success");
					setTimeout(() => {
						onPaymentSuccess();
					}, 2000);
				},
				(err: any) => {
					console.error("Error verifying payment:", err);
					setError(err.message || "Failed to verify payment");
					setPaymentState("error");
				}
			);
		},
		[invoice.invoiceId, token, role, onPaymentSuccess]
	);

	// Effect to create payment link when modal opens
	useEffect(() => {
		if (open && invoice.paymentStatus !== "PAID") {
			createPaymentLink();
		}

		return () => {
			clearIntervals();
		};
	}, [open, invoice.paymentStatus, createPaymentLink, clearIntervals]);

	// Effect for auto-checking payment status
	useEffect(() => {
		if (paymentState === "created" && paymentLink) {
			// Check every 5 seconds
			checkIntervalRef.current = setInterval(checkPaymentStatus, 5000);

			// Countdown timer
			countdownIntervalRef.current = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearIntervals();
						setPaymentState("cancelled");
						setError("Payment time expired");
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			clearIntervals();
		};
	}, [paymentState, paymentLink, checkPaymentStatus, clearIntervals]);

	const handleClose = () => {
		clearIntervals();
		onClose();
	};

	const handleRetry = () => {
		createPaymentLink();
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const renderContent = () => {
		switch (paymentState) {
			case "loading":
				return (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							py: 4,
						}}
					>
						<CircularProgress />
						<Typography sx={{ mt: 2 }}>Creating payment QR code...</Typography>
					</Box>
				);

			case "created":
				return (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{/* Payment Info */}
						<Box sx={{ width: "100%", mb: 3 }}>
							<Typography variant="body2" color="text.secondary">
								Invoice ID: #{invoice.invoiceId}
							</Typography>
							<Typography variant="h5" color="primary" sx={{ mt: 1 }}>
								{formatCurrency(invoice.totalAmount)}
							</Typography>
							{/* Demo amount notice */}
							<Box sx={{ mt: 1, p: 1, backgroundColor: "#fff3e0", borderRadius: 1 }}>
								<Typography variant="caption" color="warning.dark">
									⚠️ Demo: QR amount = {formatCurrency(Math.round(invoice.totalAmount / 100))} (÷100)
								</Typography>
							</Box>
							{/* Payment reference code */}
							<Box sx={{ mt: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
								<Typography variant="body2" color="primary.dark">
									Ref Code: <strong style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{paymentCodeRef.current}</strong>
								</Typography>
							</Box>
							{paymentMethod && (
								<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
									Payment Method: <strong>{paymentMethod.methodName}</strong>
								</Typography>
							)}
						</Box>

						<Divider sx={{ width: "100%", mb: 3 }} />

{/* VietQR Code - Direct banking app payment */}
							{generateVietQRUrl ? (
								<Box
									sx={{
										p: 2,
										backgroundColor: "white",
										borderRadius: 2,
										boxShadow: 2,
										mb: 2,
									}}
								>
									<img
										src={generateVietQRUrl}
										alt="VietQR Payment"
										style={{ width: 280, height: 'auto' }}
									/>
								</Box>
							) : paymentLink?.checkoutUrl ? (
								<Box
									sx={{
										p: 2,
										backgroundColor: "white",
										borderRadius: 2,
										boxShadow: 2,
										mb: 2,
									}}
								>
									<QRCodeSVG
										value={paymentLink.checkoutUrl}
										size={256}
										level="H"
										includeMargin={true}
									/>
								</Box>
							) : (
								<Box
									sx={{
										p: 4,
										backgroundColor: "#f5f5f5",
										borderRadius: 2,
										mb: 2,
										textAlign: "center",
									}}
								>
									<Typography>
										Payment code: <strong>{paymentLink?.orderCode}</strong>
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
										Waiting for bank info...
									</Typography>
							</Box>
						)}

						<Typography variant="body2" sx={{ mb: 1 }}>
							Scan QR code to pay via banking app
						</Typography>

						{/* Countdown */}
						<Chip
							label={`Time remaining: ${formatTime(countdown)}`}
							color={countdown > 60 ? "primary" : "warning"}
							sx={{ mb: 2 }}
						/>

						{/* Auto-check status indicator */}
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<CircularProgress size={16} sx={{ mr: 1 }} />
							<Typography variant="body2" color="text.secondary">
								Checking payment status...
							</Typography>
						</Box>
					</Box>
				);

			case "checking":
				return (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							py: 4,
						}}
					>
						<CircularProgress />
						<Typography sx={{ mt: 2 }}>Verifying payment...</Typography>
					</Box>
				);

			case "success":
				return (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							py: 4,
						}}
					>
						<SuccessIcon color="success" sx={{ fontSize: 80 }} />
						<Typography variant="h6" sx={{ mt: 2, color: "success.main" }}>
							Payment successful!
						</Typography>
						<Typography color="text.secondary">
							Invoice #{invoice.invoiceId} has been paid
						</Typography>
					</Box>
				);

			case "cancelled":
			case "error":
				return (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							py: 4,
						}}
					>
						<ErrorIcon color="error" sx={{ fontSize: 80 }} />
						<Typography variant="h6" sx={{ mt: 2, color: "error.main" }}>
							{paymentState === "cancelled" ? "Payment failed" : "An error occurred"}
						</Typography>
						{error && (
							<Alert severity="error" sx={{ mt: 2, width: "100%" }}>
								{error}
							</Alert>
						)}
						<Button
							variant="contained"
							startIcon={<RefreshIcon />}
							onClick={handleRetry}
							sx={{ mt: 2 }}
						>
							Retry
						</Button>
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			disableEscapeKeyDown={paymentState === "checking"}
		>
			<DialogTitle sx={{ textAlign: "center" }}>QR Code Payment</DialogTitle>
			<DialogContent>{renderContent()}</DialogContent>
			<DialogActions>
				{paymentState !== "success" && paymentState !== "checking" && (
					<Button onClick={handleClose}>Close</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default PaymentQRModal;
