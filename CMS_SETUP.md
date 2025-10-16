# 🎨 Decap CMS Setup Guide (GitHub OAuth)

## ✅ What's Installed

Decap CMS with GitHub OAuth authentication - no deprecated Netlify Identity needed!

---

## 🚀 Complete Setup (5 minutes)

### **Step 1: Create GitHub OAuth App** (3 minutes)

1. **Go to GitHub**:
   - Visit: https://github.com/settings/developers
   - Or: GitHub Settings → Developer settings → OAuth Apps

2. **Click**: "New OAuth App"

3. **Fill in details**:
   ```
   Application name: ozturkbatu.com CMS
   Homepage URL: https://www.ozturkbatu.com
   Authorization callback URL: https://api.netlify.com/auth/done
   ```

4. **Click**: "Register application"

5. **Save these credentials**:
   - **Client ID**: (shown on screen - copy it)
   - **Client Secret**: Click "Generate a new client secret" → Copy it
   - **Save both securely!**

### **Step 2: Add OAuth to Netlify** (2 minutes)

1. **Go to Netlify Dashboard**: https://app.netlify.com

2. **Your site** → **Site configuration** → **Access control**

3. **Scroll to**: "OAuth" section

4. **Click**: "Install provider"

5. **Select**: "GitHub"

6. **Enter your credentials**:
   ```
   Client ID: [paste from GitHub]
   Client Secret: [paste from GitHub]
   ```

7. **Click**: "Install"

### **Step 3: Deploy and Access** (2 minutes)

Deploy is already in progress! After it finishes:

1. **Visit**: https://www.ozturkbatu.com/admin/

2. **Click**: "Login with GitHub"

3. **Authorize the app** (first time only)

4. **You're in!** Start creating content!

---

## 📝 Using the CMS

### **Create a New Blog Post:**

1. **Go to**: https://www.ozturkbatu.com/admin/
2. **Click**: "Blog Posts" in sidebar
3. **Click**: "New Blog Posts" button
4. **Fill in**:
   - ✍️ Title
   - 📄 Description (for SEO)
   - 📅 Publish Date
   - 👤 Author (auto-filled)
   - 🏷️ Tags (add multiple)
   - 🖼️ Featured Image (optional)
   - 📝 Body (rich Markdown editor)

5. **Save Options**:
   - **"Save"**: Saves as draft
   - **"Publish"**: Creates pull request
   - **"Publish now"**: Commits directly (if you have permissions)

6. **Auto-deploys**: Netlify builds in 2-3 minutes!

### **Editorial Workflow:**

Your CMS uses editorial workflow with 3 stages:

```
Drafts → In Review → Ready
```

1. **Drafts**: Work in progress
2. **In Review**: Ready for review (can move back to drafts)
3. **Ready**: Approved and will be published

**Move posts** by dragging between columns!

### **Upload Images:**

1. **Click**: Image field in any post
2. **Choose**: Upload or select from media library
3. **Upload**: Images saved to `/public/images/blog/`
4. **Auto-inserted**: Markdown image syntax

---

## 🔌 API Access

### **Direct GitHub API:**

Since you're using GitHub backend, you can use GitHub API directly:

**Create a blog post via API:**

```python
import requests
import base64
from datetime import datetime

GITHUB_TOKEN = "your_github_personal_access_token"
REPO = "Marketitive/ozturkbatu.com"

def create_post(title, content, tags=["marketing"], description=""):
    slug = title.lower().replace(" ", "-")
    
    frontmatter = f"""---
title: "{title}"
description: "{description}"
pubDate: "{datetime.now().strftime('%Y-%m-%d')}"
author: "Batuhan Ozturk"
tags: {tags}
---

{content}
"""
    
    encoded = base64.b64encode(frontmatter.encode()).decode()
    
    url = f"https://api.github.com/repos/{REPO}/contents/src/content/blog/{slug}.mdx"
    
    response = requests.put(
        url,
        headers={
            "Authorization": f"token {GITHUB_TOKEN}",
            "Content-Type": "application/json"
        },
        json={
            "message": f"Add blog post: {title}",
            "content": encoded
        }
    )
    
    return response.json()

# Usage
create_post(
    title="My API-Generated Post",
    content="# Hello World\n\nThis was created via API!",
    tags=["automation", "api"],
    description="A post created programmatically"
)
```

**Get GitHub Token:**
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Permissions: `repo` (full control)
5. Generate & copy token

---

## 🤖 Automation Workflows

### **Workflow 1: Scheduled Posts**

Create `.github/workflows/weekly-post.yml`:

```yaml
name: Weekly Post
on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday 9 AM
  workflow_dispatch:

jobs:
  create-post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create weekly post
        run: |
          DATE=$(date +%Y-%m-%d)
          cat > src/content/blog/weekly-roundup-$DATE.mdx << 'EOF'
          ---
          title: "Weekly Marketing Roundup - $(date +%B %d, %Y)"
          description: "This week's top marketing insights"
          pubDate: "$DATE"
          author: "Batuhan Ozturk"
          tags: ["weekly", "marketing", "roundup"]
          ---
          
          # This Week in Marketing
          
          ## Top Stories
          
          Your content here...
          EOF
      
      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Add weekly roundup"
          git push
```

### **Workflow 2: Email to Blog**

Use Zapier or Make.com:

1. **Trigger**: New email in specific folder
2. **Action**: HTTP request to GitHub API
3. **Result**: Email becomes blog post

### **Workflow 3: AI-Generated Content**

```python
import openai
import requests
from datetime import datetime

def ai_blog_post(topic):
    # Generate content with AI
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"Write a blog post about {topic} for a marketing blog"
        }]
    )
    
    content = response.choices[0].message.content
    
    # Publish via GitHub API
    create_post(
        title=f"AI Insights: {topic}",
        content=content,
        tags=["ai", "automation"],
        description=f"AI-generated insights on {topic}"
    )

# Usage
ai_blog_post("The Future of Marketing Automation")
```

---

## 🎯 CMS Features

### **Visual Editor:**
- ✅ Rich text editing
- ✅ Markdown preview
- ✅ Image uploads
- ✅ Drag & drop media
- ✅ Live preview

### **Content Management:**
- ✅ Create/edit/delete posts
- ✅ Draft workflow
- ✅ Search posts
- ✅ Filter by status
- ✅ Organize by tags

### **Publishing:**
- ✅ Save as draft
- ✅ Publish immediately
- ✅ Editorial workflow
- ✅ Git version control
- ✅ Auto-deploy on publish

### **Media Library:**
- ✅ Upload images
- ✅ Browse media
- ✅ Insert into posts
- ✅ Automatic paths
- ✅ Organized folders

---

## 🔐 Security & Access

### **GitHub OAuth:**
- ✅ Uses your GitHub account
- ✅ No separate password
- ✅ GitHub permissions apply
- ✅ Secure by default
- ✅ No deprecated services

### **Who Can Access:**
- Only GitHub collaborators on the repo
- You (owner) have full access
- Can add team members via GitHub

### **API Access:**
- GitHub Personal Access Token
- Full control over content
- Same permissions as CMS
- Secure token management

---

## 🚀 Quick Start

After deploy finishes:

1. **Enable OAuth** in Netlify (see Step 2 above)
2. **Visit**: https://www.ozturkbatu.com/admin/
3. **Click**: "Login with GitHub"
4. **Authorize**: First time only
5. **Start creating!**

**No Identity setup needed!** Much simpler! ✅

---

## 📊 Comparison: CMS vs API

### **Use CMS Dashboard When:**
- ✅ Writing long-form content
- ✅ Editing with rich editor
- ✅ Uploading images
- ✅ Preview before publish
- ✅ Manual content creation

### **Use API When:**
- ✅ Bulk operations
- ✅ Automated publishing
- ✅ Scheduled posts
- ✅ Integration with tools
- ✅ Programmatic content

### **Best Practice:**
Use **both**! Create drafts via API, review/edit in CMS, then publish!

---

## 🎯 Your Automation Options

### **Simple (No Code):**
1. **Decap CMS Dashboard**: Visual editor at `/admin`
2. **GitHub Web**: Edit files directly on GitHub
3. **Both trigger**: Automatic Netlify deploy

### **Intermediate (Low Code):**
1. **Zapier/Make.com**: Connect tools to GitHub
2. **IFTTT**: Simple automation
3. **GitHub Actions**: Scheduled workflows

### **Advanced (Full Control):**
1. **GitHub API**: Python/Node.js scripts
2. **Custom webhooks**: Receive and process
3. **AI integration**: Generate content automatically
4. **Multi-step pipelines**: Complex workflows

---

## 📋 Setup Checklist

- [x] CMS files created
- [x] GitHub backend configured
- [x] Build successful
- [x] Code pushed to GitHub
- [ ] Wait for Netlify deploy (2-3 minutes)
- [ ] Create GitHub OAuth app
- [ ] Add OAuth to Netlify
- [ ] Visit /admin and login
- [ ] Create first post via CMS
- [ ] (Optional) Set up API automation

---

## 💡 Advantages of GitHub Backend

**vs. Netlify Identity (deprecated):**
- ✅ Not deprecated (future-proof)
- ✅ Simpler setup
- ✅ Uses existing GitHub account
- ✅ Better for teams
- ✅ Version control built-in
- ✅ No extra service needed

**For API access:**
- ✅ Direct GitHub API (well-documented)
- ✅ High rate limits (5000/hour)
- ✅ Webhooks available
- ✅ Integrates with everything
- ✅ Industry standard

---

## 🎊 Summary

Your CMS setup:

**Authentication**: GitHub OAuth (modern, not deprecated)
**Backend**: GitHub (your existing repo)
**Storage**: Git (version controlled)
**Deploy**: Netlify (automatic)
**API**: GitHub API (full access)

**Benefits**:
- No deprecated services ✅
- Simpler setup ✅
- Better for automation ✅
- Future-proof ✅

---

## 📚 Documentation

- **See**: `API_EXAMPLES.md` for automation code
- **Decap CMS Docs**: https://decapcms.org/docs
- **GitHub API**: https://docs.github.com/en/rest

---

**Next**: Wait for deploy, then set up GitHub OAuth! 🚀
