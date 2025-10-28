// Order complete email builder
// Returns an object with { subject, text, html } for use with an email sender

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(num) {
  try {
    const currency = process.env.DEFAULT_CURRENCY || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(num);
  } catch (e) {
    return (num || 0).toFixed(2);
  }
}

function buildOrderItemsHtml(items) {
  if (!Array.isArray(items) || items.length === 0) return "";

  return items
    .map((it) => {
      const name =
        it.prodctName ||
        it.productName ||
        (it.product && it.product.name) ||
        "Product";
      const price = Number(
        it.productPrice || (it.product && it.product.price) || 0
      );
      const qty = Number(it.quantity || 1);
      const img = it.productImage || (it.product && it.product.image) || "";
      const size = it.selectedSize
        ? `<div style="color:#666;font-size:12px">Size: ${escapeHtml(
            it.selectedSize
          )}</div>`
        : "";
      const colour = it.selectedColour
        ? `<div style="color:#666;font-size:12px">Colour: ${escapeHtml(
            it.selectedColour
          )}</div>`
        : "";

      return `
				<tr>
					<td style="padding:12px 0;border-bottom:1px solid #eee;">
						<table width="100%" cellspacing="0" cellpadding="0" role="presentation">
							<tr>
								<td width="88" style="vertical-align:top;padding-right:12px;">
									${
                    img
                      ? `<img src="${escapeHtml(
                          img
                        )}" width="80" style="border-radius:6px;display:block;">`
                      : ""
                  }
								</td>
								<td style="vertical-align:top;">
									<div style="font-weight:600;color:#111">${escapeHtml(name)}</div>
									${size}
									${colour}
									<div style="margin-top:6px;color:#444">${formatCurrency(price)} × ${qty}</div>
								</td>
								<td style="vertical-align:top;text-align:right;white-space:nowrap;">
									<div style="font-weight:700;color:#111">${formatCurrency(price * qty)}</div>
								</td>
							</tr>
						</table>
					</td>
				</tr>`;
    })
    .join("\n");
}

function buildPlainText(order, user) {
  const lines = [];
  lines.push(`Order ${order._id} — Completed`);
  lines.push("");
  lines.push(
    `Hello ${
      user && (user.name || user.email) ? user.name || user.email : "Customer"
    },`
  );
  lines.push("Thank you — your order is complete.");
  lines.push("");
  lines.push("Order summary:");

  if (Array.isArray(order.orderItems)) {
    order.orderItems.forEach((it) => {
      const name =
        it.prodctName ||
        it.productName ||
        (it.product && it.product.name) ||
        "Product";
      const price = Number(
        it.productPrice || (it.product && it.product.price) || 0
      );
      const qty = Number(it.quantity || 1);
      lines.push(
        `${name} — ${qty} × ${formatCurrency(price)} = ${formatCurrency(
          price * qty
        )}`
      );
    });
  }

  lines.push("");
  lines.push(`Total: ${formatCurrency(order.totalPrice || 0)}`);
  if (order.shippingAddress)
    lines.push(
      `Ship to: ${order.shippingAddress}, ${order.city || ""} ${
        order.postalCode || ""
      } ${order.country || ""}`
    );
  if (order.phone) lines.push(`Phone: ${order.phone}`);
  if (order.paymentId) lines.push(`Payment ID: ${order.paymentId}`);
  lines.push("");
  lines.push(
    "If you have any questions, reply to this email or visit our support page."
  );
  return lines.join("\n");
}

function buildOrderCompleteEmail(order = {}, user = {}) {
  const siteName = process.env.SITE_NAME || "Ecomly";
  const siteUrl = process.env.SITE_URL || "";

  const subject = `Your ${siteName} order ${order._id || ""} is complete`;

  const html = `
	<!doctype html>
	<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width,initial-scale=1">
		</head>
		<body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;margin:0;padding:24px;">
			<div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
				<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
					<tr>
						<td style="padding:24px 28px;background:#111;color:#fff;">
							<a href="${escapeHtml(
                siteUrl
              )}" style="color:#fff;text-decoration:none;font-size:20px;font-weight:700;">${escapeHtml(
    siteName
  )}</a>
						</td>
					</tr>
					<tr>
						<td style="padding:28px;">
							<h2 style="margin:0 0 8px 0;color:#111;font-family:Arial,Helvetica,sans-serif">Thanks — your order is complete</h2>
							<p style="margin:0 0 18px 0;color:#555">We’ve finished processing your order <strong>${escapeHtml(
                order._id || ""
              )}</strong>. Below is a summary of what will be shipped.</p>

							<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:6px;border-collapse:collapse;">
								${buildOrderItemsHtml(order.orderItems || [])}
							</table>

							<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:18px;">
								<tr>
									<td style="color:#666">Subtotal</td>
									<td style="text-align:right;font-weight:600">${formatCurrency(
                    order.totalPrice || 0
                  )}</td>
								</tr>
								<tr>
									<td style="color:#666;padding-top:6px">Shipping</td>
									<td style="text-align:right;padding-top:6px;color:#666">${formatCurrency(
                    order.shippingPrice || 0
                  )}</td>
								</tr>
								<tr>
									<td style="padding-top:12px;font-weight:700">Total</td>
									<td style="text-align:right;padding-top:12px;font-weight:700">${formatCurrency(
                    order.totalPrice || 0
                  )}</td>
								</tr>
							</table>

							<div style="margin-top:20px;padding:14px;border-radius:6px;background:#fafafa;color:#333;font-size:14px;">
								<div style="font-weight:600;margin-bottom:6px">Shipping address</div>
								<div style="color:#555">${escapeHtml(order.shippingAddress || "")}</div>
								<div style="color:#555">${escapeHtml(order.city || "")} ${escapeHtml(
    order.postalCode || ""
  )}</div>
								<div style="color:#555">${escapeHtml(order.country || "")}</div>
								${
                  order.phone
                    ? `<div style="margin-top:6px;color:#555">Phone: ${escapeHtml(
                        order.phone
                      )}</div>`
                    : ""
                }
							</div>

							<div style="text-align:center;margin-top:26px;">
								<a href="${escapeHtml(
                  siteUrl
                )}" style="display:inline-block;padding:12px 20px;border-radius:6px;background:#111;color:#fff;text-decoration:none;font-weight:600">View your order</a>
							</div>

							<p style="color:#999;font-size:12px;margin-top:22px">If you have any questions, reply to this email or visit our help center.</p>
						</td>
					</tr>
					<tr>
						<td style="padding:14px 28px;background:#f7f7f7;color:#888;font-size:13px;text-align:center;">
							${escapeHtml(siteName)} • ${escapeHtml(siteUrl)}
						</td>
					</tr>
				</table>
			</div>
		</body>
	</html>`;

  const text = buildPlainText(order, user);

  return { subject, text, html };
}

module.exports = {
  buildOrderCompleteEmail,
};
