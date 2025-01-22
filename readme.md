
![Logo](assets/soi.png)


# Groupify

Groupify is a modern web application designed to simplify team creation by automatically splitting members into balanced teams based on customizable criteria. It's user-friendly, stylish, and efficient, making it perfect for schools, organizations, and other collaborative setups.




## Instructions

#### Split the teams based on Gender 

```http
  Must add a attribute as Gender in your csv file .
  Example :
```

| S.No | Name     | Gender                |
| :-------- | :------- | :------------------------- |
| `1` | `Mathi Yuvarajan` | **Male**.  |
| `2` | `Ramya Radhakrishnan` | **Female**.  |
 
 

## Acknowledgements

 - Upload CSV Files: Drag and drop or upload CSV files containing team member details.
- Flexible Team Configuration:
    - Set the total number of members per team.
    - Specify minimum boys or girls in each team.
- Error Handling :
    - Ensures the presence of mandatory columns (Name and Gender).
    - Case-insensitive validation for gender values (e.g., Male, male, M, etc.).
- Data Transformation: 
    -  Automatically standardizes Gender values in the CSV.
    - Generates balanced teams based on your preferences. 
- Download Updated CSV: 
    - Save the processed data locally with a single click.
- Responsive Design: 
    - Minimal and modern UI that works across devices.
- Toast Notifications: 
    - Informative and stylish notifications for user actions and feedback.
## License

[MIT](https://choosealicense.com/licenses/mit/)

