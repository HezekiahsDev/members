# Iframe Embedding Guide for Wix

This guide explains how to embed your Members Area component in a Wix site without scrollbars.

## Component Usage

### Basic Embedding

```tsx
<MembersArea isEmbedded={true} />
```

### With Bot Continuation

```tsx
<MembersArea isEmbedded={true} startBotAt={4} />
```

## Wix Iframe Setup

### 1. HTML Embed Code for Wix

```html
<iframe
  id="membersAreaFrame"
  src="https://your-domain.com/members?embedded=true"
  style="
    width: 100%; 
    height: 600px; 
    border: none; 
    overflow: hidden;
    background: transparent;
  "
  scrolling="no"
  frameborder="0"
  allow="clipboard-write"
>
</iframe>

<script>
  // Listen for height updates from the iframe
  window.addEventListener("message", function (event) {
    // IMPORTANT: Change '*' to your actual domain for security
    // if (event.origin !== 'https://your-domain.com') return;

    if (event.data.type === "setIframeHeight") {
      const iframe = document.getElementById("membersAreaFrame");
      if (iframe) {
        iframe.style.height = event.data.height + "px";
        iframe.style.overflow = "hidden";
      }
    }
  });
</script>
```

### 2. Wix HTML Element Setup

1. Add an HTML element to your Wix page
2. Paste the above code
3. Replace `https://your-domain.com/members?embedded=true` with your actual URL
4. Update the security origin check in the script

### 3. URL Parameters

Your members page should detect the `embedded=true` parameter:

```tsx
// In your page component
const searchParams = useSearchParams();
const isEmbedded = searchParams.get("embedded") === "true";

return <MembersArea isEmbedded={isEmbedded} />;
```

## Key Features for Iframe Embedding

### ✅ Implemented Features:

- **No Scrollbars**: Uses `overflow: hidden` and custom scrollbar hiding
- **Dynamic Height**: Automatically resizes iframe based on content
- **Transparent Background**: Seamless integration with Wix design
- **Header Hiding**: Optionally hide navigation when embedded
- **Content Fitting**: Ensures content doesn't exceed viewport height

### ✅ CSS Classes Added:

- `.scrollbar-hide`: Hides scrollbars across browsers
- `.iframe-container`: Container optimizations for iframe
- `.iframe-content`: Content area optimizations

### ✅ Responsive Design:

- Maintains responsiveness within iframe constraints
- Proper mobile/tablet handling
- Tab switching works seamlessly

## Testing Checklist

Before deploying to Wix:

1. **Local Testing**:

   ```bash
   npm run dev
   # Visit: http://localhost:3000/members?embedded=true
   ```

2. **Height Dynamic Resize**: Switch between tabs and verify height adjusts

3. **No Scrollbars**: Confirm no scrollbars appear in any tab

4. **Mobile Responsive**: Test on different screen sizes

5. **Cross-Origin**: Ensure postMessage works between domains

## Security Considerations

1. **Origin Validation**: Replace `"*"` with your Wix domain:

   ```javascript
   if (event.origin !== "https://yoursite.wixsite.com") return;
   ```

2. **CSP Headers**: Ensure your site allows iframe embedding:
   ```
   Content-Security-Policy: frame-ancestors 'self' https://*.wixsite.com;
   ```

## Troubleshooting

### Issue: Scrollbars Still Appear

- Check that `isEmbedded={true}` is set
- Verify CSS classes are loaded
- Check browser developer tools for overriding styles

### Issue: Height Not Updating

- Check browser console for postMessage errors
- Verify iframe ID matches script
- Ensure domains are configured correctly

### Issue: Content Cut Off

- The component automatically manages height
- Check that Wix HTML element has enough space
- Verify no CSS max-height restrictions in Wix

## Advanced Configuration

### Custom Height Limits

```tsx
// In your useEffect for height management
const maxHeight = 800; // Set custom max height
const height = Math.min(element.scrollHeight, maxHeight);
```

### Custom Styling for Embedded Mode

```tsx
<div className={cn(
  "members-area",
  isEmbedded && "embedded-mode custom-embedded-styles"
)}>
```
