from setuptools import setup, find_packages

setup(
    name="nirium-sdk",
    version="1.0.0",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    install_requires=[
        "websockets>=11.0.3",
        "aiohttp>=3.8.4",
    ],
    author="Nirium Team",
    description="Official Python SDK for Nirium Autonomous Agents",
)
