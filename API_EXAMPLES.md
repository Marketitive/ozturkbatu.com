# 🔌 API Automation Examples

Quick reference for automating content via HTTP requests.

---

## 🔑 Setup

### **1. Get GitHub Personal Access Token:**

1. Go to: https://github.com/settings/tokens
2. Click: "Generate new token" → "Tokens (classic)"
3. Name: "Blog Automation"
4. Permissions: Select `repo` (full repository access)
5. Generate & Copy token
6. **Save securely!** (You won't see it again)

### **2. Test Authentication:**

```bash
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/user
```

Should return your GitHub user info.

---

## 📝 Create Blog Post via API

### **Method 1: cURL (Command Line)**

```bash
#!/bin/bash

GITHUB_TOKEN="your_token_here"
REPO="Marketitive/ozturkbatu.com"
TITLE="My New Post"
SLUG="my-new-post"

# Create post content
CONTENT=$(cat << EOF
---
title: "${TITLE}"
description: "This post was created via API"
pubDate: "$(date +%Y-%m-%d)"
author: "Batuhan Ozturk"
tags: ["automation", "api"]
---

# ${TITLE}

This blog post was created automatically via the GitHub API!

## Section 1

Your content here...

## Conclusion

Automated content creation is powerful!
EOF
)

# Encode to base64
ENCODED=$(echo "$CONTENT" | base64)

# Create file via GitHub API
curl -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Add blog post: ${TITLE}\",
    \"content\": \"${ENCODED}\"
  }" \
  "https://api.github.com/repos/${REPO}/contents/src/content/blog/${SLUG}.mdx"
```

### **Method 2: Python**

```python
import requests
import base64
from datetime import datetime

class BlogAutomation:
    def __init__(self, github_token):
        self.token = github_token
        self.repo = "Marketitive/ozturkbatu.com"
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Content-Type": "application/json"
        }
    
    def create_post(self, title, content, tags=None, description=None):
        """Create a new blog post"""
        if tags is None:
            tags = ["marketing"]
        if description is None:
            description = content[:150]
        
        # Generate slug
        slug = title.lower().replace(" ", "-").replace("'", "")
        
        # Create frontmatter
        frontmatter = f"""---
title: "{title}"
description: "{description}"
pubDate: "{datetime.now().strftime('%Y-%m-%d')}"
author: "Batuhan Ozturk"
tags: {tags}
---

{content}
"""
        
        # Encode content
        encoded = base64.b64encode(frontmatter.encode()).decode()
        
        # API request
        url = f"{self.base_url}/repos/{self.repo}/contents/src/content/blog/{slug}.mdx"
        data = {
            "message": f"Add blog post: {title}",
            "content": encoded
        }
        
        response = requests.put(url, headers=self.headers, json=data)
        return response.json()
    
    def update_post(self, filename, new_content):
        """Update existing blog post"""
        # Get current file SHA
        url = f"{self.base_url}/repos/{self.repo}/contents/src/content/blog/{filename}"
        response = requests.get(url, headers=self.headers)
        sha = response.json()['sha']
        
        # Update file
        encoded = base64.b64encode(new_content.encode()).decode()
        data = {
            "message": f"Update: {filename}",
            "content": encoded,
            "sha": sha
        }
        
        response = requests.put(url, headers=self.headers, json=data)
        return response.json()
    
    def delete_post(self, filename):
        """Delete blog post"""
        # Get current file SHA
        url = f"{self.base_url}/repos/{self.repo}/contents/src/content/blog/{filename}"
        response = requests.get(url, headers=self.headers)
        sha = response.json()['sha']
        
        # Delete file
        data = {
            "message": f"Delete: {filename}",
            "sha": sha
        }
        
        response = requests.delete(url, headers=self.headers, json=data)
        return response.status_code == 200
    
    def list_posts(self):
        """List all blog posts"""
        url = f"{self.base_url}/repos/{self.repo}/contents/src/content/blog"
        response = requests.get(url, headers=self.headers)
        return [item['name'] for item in response.json() if item['name'].endswith('.mdx')]

# Usage
blog = BlogAutomation("your_github_token_here")

# Create new post
blog.create_post(
    title="Automated Marketing Insights",
    content="""
# Introduction

This post was created automatically!

## Key Points

- Point 1
- Point 2
- Point 3

## Conclusion

Automation saves time!
""",
    tags=["marketing", "automation", "ai"],
    description="Insights on automated marketing strategies"
)

# List all posts
posts = blog.list_posts()
print(f"Total posts: {len(posts)}")

# Update existing post
# blog.update_post("my-post.mdx", new_content)

# Delete post
# blog.delete_post("my-post.mdx")
```

### **Method 3: Node.js / JavaScript**

```javascript
const fetch = require('node-fetch');
const { Buffer } = require('buffer');

class BlogAutomation {
  constructor(githubToken) {
    this.token = githubToken;
    this.repo = 'Marketitive/ozturkbatu.com';
    this.baseUrl = 'https://api.github.com';
    this.headers = {
      'Authorization': `token ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async createPost({ title, content, tags = ['marketing'], description = null }) {
    // Generate slug
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
    
    // Create frontmatter
    const frontmatter = `---
title: "${title}"
description: "${description || content.substring(0, 150)}"
pubDate: "${new Date().toISOString().split('T')[0]}"
author: "Batuhan Ozturk"
tags: ${JSON.stringify(tags)}
---

${content}
`;

    // Encode content
    const encoded = Buffer.from(frontmatter).toString('base64');
    
    // API request
    const url = `${this.baseUrl}/repos/${this.repo}/contents/src/content/blog/${slug}.mdx`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({
        message: `Add blog post: ${title}`,
        content: encoded
      })
    });

    return await response.json();
  }

  async listPosts() {
    const url = `${this.baseUrl}/repos/${this.repo}/contents/src/content/blog`;
    const response = await fetch(url, { headers: this.headers });
    const files = await response.json();
    return files.filter(f => f.name.endsWith('.mdx')).map(f => f.name);
  }
}

// Usage
const blog = new BlogAutomation('your_github_token_here');

blog.createPost({
  title: 'My Automated Post',
  content: `
# Introduction

This was created via Node.js!

## Content

Your content here...
`,
  tags: ['automation', 'nodejs'],
  description: 'Post created via API'
}).then(result => {
  console.log('Post created:', result);
});
```

---

## 🔄 Trigger Netlify Deploy

After creating/updating content, trigger a deploy:

### **Method 1: Build Hook**

```bash
# Get build hook from: Netlify → Site settings → Build & deploy → Build hooks
curl -X POST https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK_ID
```

### **Method 2: Netlify API**

```python
import requests

NETLIFY_TOKEN = "your_netlify_token"
SITE_ID = "your_site_id"

def trigger_deploy():
    url = f"https://api.netlify.com/api/v1/sites/{SITE_ID}/builds"
    headers = {"Authorization": f"Bearer {NETLIFY_TOKEN}"}
    
    response = requests.post(url, headers=headers)
    return response.json()
```

---

## 🤖 Integration Examples

### **Example 1: Email to Blog Post**

```python
# Using Gmail API to convert emails to blog posts
from googleapiclient.discovery import build
import base64

def email_to_blog_post(email_id):
    # Get email content
    service = build('gmail', 'v1', credentials=creds)
    msg = service.users().messages().get(userId='me', id=email_id).execute()
    
    # Extract subject and body
    headers = msg['payload']['headers']
    subject = next(h['value'] for h in headers if h['name'] == 'Subject')
    body = base64.urlsafe_b64decode(msg['payload']['body']['data']).decode()
    
    # Create blog post
    blog.create_post(
        title=subject,
        content=body,
        tags=["email", "automation"]
    )
```

### **Example 2: RSS Feed to Blog**

```python
import feedparser

def import_from_rss(feed_url):
    feed = feedparser.parse(feed_url)
    
    for entry in feed.entries[:5]:  # Import latest 5
        blog.create_post(
            title=entry.title,
            content=entry.summary,
            tags=["imported", "rss"],
            description=entry.description
        )
```

### **Example 3: Scheduled Weekly Post**

```python
# Run this with cron or GitHub Actions
from datetime import datetime

def weekly_roundup():
    title = f"Weekly Marketing Roundup - {datetime.now().strftime('%B %d, %Y')}"
    
    content = """
# This Week in Marketing

## Top Stories

1. Story 1
2. Story 2
3. Story 3

## Insights

Key takeaways from this week...

## Next Week

What to watch for...
"""
    
    blog.create_post(
        title=title,
        content=content,
        tags=["weekly", "roundup", "marketing"]
    )

# Run every Monday at 9 AM
weekly_roundup()
```

---

## 📊 Monitoring & Analytics

### **Check Deploy Status:**

```python
def check_deploy_status(deploy_id):
    url = f"https://api.netlify.com/api/v1/deploys/{deploy_id}"
    headers = {"Authorization": f"Bearer {NETLIFY_TOKEN}"}
    
    response = requests.get(url, headers=headers)
    deploy = response.json()
    
    return {
        'status': deploy['state'],
        'created': deploy['created_at'],
        'url': deploy['deploy_ssl_url']
    }
```

### **List Recent Posts:**

```python
def get_recent_posts(limit=10):
    url = f"https://api.github.com/repos/{REPO}/commits?path=src/content/blog&per_page={limit}"
    response = requests.get(url, headers=headers)
    
    return [{
        'date': commit['commit']['author']['date'],
        'message': commit['commit']['message'],
        'author': commit['commit']['author']['name']
    } for commit in response.json()]
```

---

## 🔒 Security Best Practices

### **1. Environment Variables:**

```python
import os
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
NETLIFY_TOKEN = os.environ.get('NETLIFY_TOKEN')
```

### **2. Token Rotation:**

Rotate tokens every 90 days for security.

### **3. Rate Limiting:**

GitHub API: 5,000 requests/hour
Handle rate limits gracefully:

```python
def safe_api_call(url, **kwargs):
    response = requests.get(url, **kwargs)
    
    if response.status_code == 403:
        reset_time = response.headers.get('X-RateLimit-Reset')
        print(f"Rate limited. Resets at: {reset_time}")
        return None
    
    return response.json()
```

---

## 🎯 Quick Start

1. **Get GitHub token** (see Setup section)
2. **Choose your method** (Python, Node.js, or cURL)
3. **Run example code**
4. **Check GitHub** for new commit
5. **Wait 2-3 minutes** for Netlify deploy
6. **Visit blog** to see new post!

---

## 📚 Resources

- **GitHub API Docs**: https://docs.github.com/en/rest
- **Netlify API Docs**: https://docs.netlify.com/api/get-started
- **Decap CMS Docs**: https://decapcms.org/docs

---

**Happy Automating!** 🚀

