# Deploying to Vercel

## Prerequisites
- GitHub account
- Vercel account (free tier works fine)
- Your repository pushed to GitHub

## Deployment Steps

### Option 1: Using Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add counter dApp"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's a Vite project

4. **Configure Build Settings**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy
   - Answer the configuration questions
   - Get your deployment URL

### After Deployment

1. **Test your deployed app**
   - Connect your wallet
   - Try creating a counter
   - Test increment and reset functions

2. **Update PROJECT_DESCRIPTION.md**
   - Add your deployed URL to the PROJECT_DESCRIPTION.md file

3. **Share your deployment**
   - Your Vercel URL is public and can be shared
   - It will automatically redeploy when you push to main branch

## Troubleshooting

- **Build fails**: Make sure all dependencies are in package.json
- **Wallet not connecting**: Check browser console for errors
- **Transactions failing**: Verify you're on Devnet and have SOL

