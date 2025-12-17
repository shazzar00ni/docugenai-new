# Deployment Guide for DocuGenAI

This guide covers multiple deployment options for your DocuGenAI application.

## 🚀 Quick Deploy Options

### Option 1: GitHub Pages (Recommended for Beginners)

**Pros:** Free, easy, automatic HTTPS, custom domain support
**Cons:** Public repositories only (unless you have GitHub Pro)

#### Steps:

1. **Create a GitHub repository**

   ```bash
   # Initialize git if not already done
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "Initial commit: DocuGenAI"

   # Create main branch
   git branch -M main
   ```

2. **Push to GitHub**

   ```bash
   # Add your remote (replace with your repo URL)
   git remote add origin https://github.com/YOUR_USERNAME/docugenai.git

   # Push
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Click **Save**
   - Your site will be live at: `https://YOUR_USERNAME.github.io/docugenai/`

---

### Option 2: Netlify (Easiest Overall)

**Pros:** Free tier, automatic HTTPS, custom domains, continuous deployment
**Cons:** None for this use case

#### Method A: Drag and Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the entire `docugenai` folder
3. Done! Your site is live instantly

#### Method B: Git Integration

1. Push your code to GitHub (see Option 1)
2. Go to [Netlify](https://app.netlify.com)
3. Click **New site from Git**
4. Connect your repository
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/`
6. Click **Deploy site**

---

### Option 3: Vercel

**Pros:** Fast, free tier, excellent performance, automatic HTTPS
**Cons:** Requires account

#### Steps:

1. **Install Vercel CLI** (optional)

   ```bash
   npm install -g vercel
   ```

2. **Deploy**

   ```bash
   # From your project directory
   vercel

   # Follow the prompts
   # Your site will be live instantly
   ```

Or use the web interface:

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Deploy with default settings

---

### Option 4: Cloudflare Pages

**Pros:** Free, fast CDN, unlimited bandwidth
**Cons:** Requires Cloudflare account

#### Steps:

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **Create a project**
3. Connect your Git repository
4. Configure build:
   - Build command: (none)
   - Build output directory: `/`
5. Click **Save and Deploy**

---

### Option 5: Firebase Hosting

**Pros:** Google infrastructure, free tier, custom domains
**Cons:** Requires Firebase setup

#### Steps:

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**

   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure** (`firebase.json`)

   ```json
   {
     "hosting": {
       "public": ".",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
     }
   }
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

---

### Option 6: AWS S3 + CloudFront

**Pros:** Highly scalable, professional
**Cons:** More complex, costs may apply

#### Steps:

1. **Create S3 Bucket**

   - Go to AWS S3 Console
   - Create bucket with public access
   - Enable static website hosting

2. **Upload Files**

   ```bash
   aws s3 sync . s3://your-bucket-name --exclude ".git/*"
   ```

3. **Set Bucket Policy**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

4. **Optional: Add CloudFront CDN**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Get HTTPS and global CDN

---

## 🔧 Custom Domain Setup

### For GitHub Pages:

1. Add `CNAME` file with your domain
2. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```

### For Netlify/Vercel:

1. Go to domain settings in dashboard
2. Add your custom domain
3. Update DNS records as instructed

---

## 🌐 Local Development Server

### Python (Built-in)

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Node.js

```bash
# Install http-server globally
npm install -g http-server

# Run
http-server -p 8000
```

### PHP

```bash
php -S localhost:8000
```

### VS Code Extension

- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

---

## ✅ Pre-Deployment Checklist

- [ ] Test all features locally
- [ ] Verify file uploads work
- [ ] Test website generation
- [ ] Check preview functionality
- [ ] Test download feature
- [ ] Verify responsive design on mobile
- [ ] Check browser console for errors
- [ ] Test with sample markdown files
- [ ] Verify all links work
- [ ] Check SEO meta tags

---

## 🔍 Post-Deployment Testing

After deployment, test:

1. **Upload Functionality**

   - Try uploading single file
   - Try uploading multiple files
   - Test drag and drop
   - Test file removal

2. **Generation**

   - Generate with one file
   - Generate with multiple files
   - Check preview loads correctly

3. **Download**

   - Download generated site
   - Open downloaded HTML locally
   - Verify it works offline

4. **Responsive Design**
   - Test on mobile device
   - Test on tablet
   - Test on desktop

---

## 📊 Performance Optimization

### Enable Compression

Most hosting platforms enable this automatically, but verify:

- Gzip/Brotli compression enabled
- Minify CSS/JS (optional for this small project)

### CDN Configuration

- Use CDN for Google Fonts (already configured)
- Consider CDN for the entire site (CloudFront, Cloudflare)

### Caching Headers

Add to hosting configuration:

```
Cache-Control: public, max-age=31536000
```

---

## 🔒 Security Considerations

### HTTPS

- All recommended platforms provide free HTTPS
- Always use HTTPS in production

### Content Security Policy

Add to `index.html` `<head>`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com;"
/>
```

---

## 📈 Analytics (Optional)

### Google Analytics

Add before `</head>`:

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

---

## 🆘 Troubleshooting

### Site Not Loading

- Check DNS propagation (can take 24-48 hours)
- Verify build completed successfully
- Check browser console for errors

### Files Not Uploading

- Check HTTPS is enabled
- Verify browser supports File API
- Check for CORS issues

### Styling Issues

- Clear browser cache
- Check CSS file loaded correctly
- Verify Google Fonts loading

---

## 📞 Support

Need help deploying?

- Check platform-specific documentation
- Open an issue on GitHub
- Contact: support@docugenai.com

---

**Happy Deploying! 🚀**
