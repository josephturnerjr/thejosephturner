# Running the site for dev

docker run -p 4000:4000 -v $(pwd):/site bretfisher/jekyll-serve

# Set up a new project 

docker run -v $(pwd):/site bretfisher/jekyll new .

# Build the current project in the local tree

docker run -v $(pwd):/site bretfisher/jekyll build

# Build prod container

docker build -t thejosephturner .
