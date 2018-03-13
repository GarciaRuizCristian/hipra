echo "Building browser resources..." 
npm install
ionic build browser

echo "Building docker..." 
docker build -t hipracrm .
#docker run -p 9081:9081 hipracrm
docker tag hipracrm registry.eu-gb.bluemix.net/hipra/hipracrm:0.0.4
docker tag hipracrm registry.eu-gb.bluemix.net/hipra/hipracrm:latest

echo "Push docker..." 
bluemix login -a https://api.eu-gb.bluemix.net -u desarrollo@krama.es -c "4bf86a183b12e6a5521d2f0ccf5816f6" -o Hipra -s HipraDEV
bluemix ic init
docker push registry.eu-gb.bluemix.net/hipra/hipracrm:latest

echo "Deploy staging..." 
bx ic stop hipracrm-web-bmdev
bx ic rm hipracrm-web-bmdev
bx ic run --name hipracrm-web-bmdev -p 80:9081 registry.eu-gb.bluemix.net/hipra/hipracrm:latest 
bx ic ip-bind 0.0.0.1 hipracrm-bmdev