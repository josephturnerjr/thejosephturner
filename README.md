# Running the site for dev

docker run -p 4000:4000 -v $(pwd):/site bretfisher/jekyll-serve

# Set up a new project 

docker run -v $(pwd):/site bretfisher/jekyll new .

# Build the current project

docker run -v $(pwd):/site bretfisher/jekyll build
