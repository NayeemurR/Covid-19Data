from django.http.response import JsonResponse
from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

import json

# Create your views here.
def index(request):
    return render(request, "viewCasesChart/index.html")





