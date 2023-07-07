# import statements
from transformers import AutoModelForSequenceClassification
from transformers import TFAutoModelForSequenceClassification
from transformers import AutoTokenizer
import mysql.connector as mysqlconn
import numpy as np
from scipy.special import softmax
import csv
import urllib.request

# global var for storing reviews
PosRvw = "" 
NegRvw = ""
NeuRvw = ""




#db connection

try:
    mydb = mysqlconn.connect(
    host="127.0.0.1",
    user="root",
    password="root",
    database="saunlp"
    )
except:
    print("Exception")


# function for sentiment analysis model
def calculatesentiment(text):
    task='sentiment'
    MODEL = f"cardiffnlp/twitter-roberta-base-{task}"
    tokenizer = AutoTokenizer.from_pretrained("tokenizer")
    # download label mapping
    labels=[]
    # mapping_link = f"https://raw.githubusercontent.com/cardiffnlp/tweeteval/main/datasets/{task}/mapping.txt"
    # with urllib.request.urlopen(mapping_link) as f:
    #     html = f.read().decode('utf-8').split("\n")
    #     csvreader = csv.reader(html, delimiter='\t')
    # labels = [row[1] for row in csvreader if len(row) > 1]

    data = [
        [0, 'negative'],
        [1, 'neutral'],
        [2, 'positive']
    ]
    labels = [row[1] for row in data if len(row) > 1]
    # PT
    model = AutoModelForSequenceClassification.from_pretrained("sentiment_model")
    encoded_input = tokenizer(text, return_tensors='pt')
    output = model(**encoded_input)
    scores = output[0][0].detach().numpy()
    scores = softmax(scores)
    ranking = np.argsort(scores)
    ranking = ranking[::-1]
    return (labels[ranking[0]])

# global variables
pos = neg = neut = 0
totalReviews = 0
positiveList = []
negativeList = []
neutralList = []


# 1: function for counting number of negative, positive, or neutral reviews
def countReviews(sentiment, text):
    if sentiment == "positive":
        global pos
        pos += 1
        positiveList.append(text)

    elif sentiment == "negative":
        global neg 
        neg += 1
        negativeList.append(text)

    else:
        global neut 
        neut += 1
        neutralList.append(text)

mycursor = mydb.cursor()
sql = "delete from modelreviews"
mycursor.execute(sql)
mydb.commit()
# function for displaying different results
def display():
    mycursor = mydb.cursor()
    print("Positive: ", pos)
    print("---------------------Positive List----------------------")
    for line in positiveList:
        print(line)
        PosRvw = line
        sql = "INSERT INTO modelreviews (PositiveReview) VALUES (%s)"
        mycursor.execute(sql,(PosRvw,))
     
    

    print("Negative: ", neg)
    print("---------------------Negative List----------------------")
    for line in negativeList:
        print(line)
        NegRvw = line
        sql = "INSERT INTO modelreviews (NegativeReview) VALUES (%s)"
        mycursor.execute(sql,(NegRvw,))

    print("Neutral: ", neut)
    print("---------------------Neutral List----------------------")
    for line in neutralList:
        print(line)
        NeuRvw = line
        sql = "INSERT INTO modelreviews (NeutralReview) VALUES (%s)"
        mycursor.execute(sql,(NeuRvw,))

    print("Total Reviews: ", totalReviews)
    print(mycursor.rowcount, "record inserted.")
    mydb.commit()


mycursor = mydb.cursor()
sql = "delete from modeldata"
mycursor.execute(sql)
mydb.commit()
# opening files and doing operations
separator = ";"
file = open(r"E:\Final Year Proj\SAUNLP-folder\uploads\test.txt", "rt")
mycursor = mydb.cursor()
for line in file:
    totalReviews += 1
    text = line.split(separator, 1)[0]
    sentiment = calculatesentiment(text)
    sql = "INSERT INTO modeldata (data) VALUES (%s)"
    mycursor.execute(sql,(text,))
    mydb.commit()
    countReviews(sentiment, text)


display()