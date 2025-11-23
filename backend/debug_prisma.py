from prisma import Prisma
import sys

print(f"Python executable: {sys.executable}")
try:
    db = Prisma()
    print("Prisma client initialized successfully.")
except Exception as e:
    print(f"Error initializing Prisma client: {e}")
