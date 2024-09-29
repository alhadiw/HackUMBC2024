import os
import base64
import requests
from openai import OpenAI
from dotenv import load_dotenv

def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

def getText(base64_image):
  #loads the .env file
  load_dotenv()
  client = OpenAI(
    # sets the api key
    api_key=os.environ.get("OPENAI_API_KEY"),
  )
  #instructs the chatbot with its role, as well as the user input
  completion = client.chat.completions.create(
    model="gpt-4o-mini",
    max_tokens=1000,
    temperature=.6,
    messages=[
      {"role": "system",
       "content": "You are an environmentalist. Take in user uploaded photos of outdoor environments"
                  "and rate them according to whether they are a green space. Our metrics for a green space have been"
                  "defined as the following on a scale of 1 - 10: 0 out of 10 if the area is fully developed/ industrialized"
                  ", 5 out of 10 if the area has a balance of infrastructure development and nature, 10 out of 10 if the area "
                  "is fully undeveloped/ completely nature. Dont give ratings of just 0,5 and 10, it should be on a scale of 0 to 10. "
                  "Be concise. Return only the rating out of 10 as an array of messages in JSON format , like this: [ {'message': '7'} ]."
                  " No reasoning is needed."},

      {"role": "user",
       "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": f"data:image/jpeg;base64,{base64_image}",
            "detail": "low"
          },
        },
      ],
       }
    ]
  )
  return completion.choices[0].message.content